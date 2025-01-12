import {Request, Response} from 'express';
import {
  newFormCallResponse,
  newOKCallResponseWithMarkdown,
  showMessageToMattermost,
  tryPromise
} from "../utils";
import { AppCallRequest, AppCallResponse } from "../types";
import { TrelloClient } from '../clients/trello';
import { addFromCommand, cardAddFromStepOne, cardAddFromStepTwo } from '../forms/card_add';
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from '../clients/kvstore';
import { ExceptionType, StoreKeys } from '../constant';
import { Exception } from '../utils/exception';
import { configureI18n } from "../utils/translations";

export const getAdd = async (request: Request, response: Response) => {
  const call: AppCallRequest = request.body;
  const i18nObj = configureI18n(call.context);

  let callResponse: AppCallResponse;
  try {
    if (call.values?.card_name && call.values?.board_name && call.values?.list_name) {
      await addFromCommand(call);
      callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.add'))
    }
    else {
      const form = await cardAddFromStepOne(call);
      callResponse = newFormCallResponse(form);
    }

    return response.json(callResponse);
  } catch(error: any) {
    callResponse = showMessageToMattermost(error);
    return response.json(callResponse);
  }
}

export const formStepOne = async (request: Request, response: Response) => {
  const call: AppCallRequest = request.body;
  let callResponse: AppCallResponse;

  try {
    const form = await cardAddFromStepTwo(call);
    callResponse = newFormCallResponse(form);
    return response.json(callResponse);
  } catch(error: any) { 
    callResponse = showMessageToMattermost(error);
    return response.json(callResponse);
  }
}

export const formStepTwo = async (request: Request, response: Response) => {
  const call: AppCallRequest = request.body;
  let callResponse: AppCallResponse;
  const i18nObj = configureI18n(call.context);

  try {
    if (!call.values?.list_select) {
      throw new Exception(ExceptionType.MARKDOWN, i18nObj.__('api.form_step_two_exception'));
    }
  
    const list_id = call.values?.list_select.value;
    const card_name = call.values?.card_name;
    const mattermostUrl = call.context.mattermost_site_url ?? '' ;
    const user_id = call.context.acting_user?.id;
  
    const options: KVStoreOptions = {
      mattermostUrl: <string>mattermostUrl,
      accessToken: <string>call.context.bot_access_token,
    };
    
    const kvClient = new KVStoreClient(options);
  
    const trelloConfig: ConfigStoreProps = await kvClient.kvGet(StoreKeys.config);
  
    const user_oauth_token = await kvClient.getOauth2User(<string>user_id)
  
    const trelloOptions = {
      apiKey: trelloConfig.trello_apikey,
      token: user_oauth_token.oauth_token,
      workspace: trelloConfig.trello_workspace
    }
  
    const trelloClient: TrelloClient = new TrelloClient(trelloOptions);

    await tryPromise(trelloClient.sendCreateCardRequest(list_id, card_name), ExceptionType.MARKDOWN, i18nObj.__('error.trello'));

    callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.add'));
    return response.json(callResponse);
  } catch(error: any) {
    callResponse = showMessageToMattermost(error);
    return response.json(callResponse);
  }
}
