import { 
   AppCallRequestWithValues, 
   AppCallResponse,
   AppCallValues
} from '../types';
import { newConfigForm } from '../forms/trello_config';
import { 
   CallResponseHandler, 
   newFormCallResponse, 
   newOKCallResponseWithMarkdown, 
   showMessageToMattermost, 
   tryPromise
} from '../utils';
import {TrelloClient, TrelloOptions} from '../clients/trello';
import {ConfigStoreProps, KVStoreClient, KVStoreOptions} from '../clients/kvstore';
import {ConfigureWorkspaceForm, ExceptionType, StoreKeys} from '../constant';
import { configureI18n } from "../utils/translations";

export const openTrelloConfigForm: CallResponseHandler = async (req, res) => {
   let callResponse: AppCallResponse;

   try {
      const form = await newConfigForm(req.body);
      callResponse = newFormCallResponse(form);
      res.json(callResponse);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
      res.json(callResponse);
   }
};

export const submitTrelloConfig: CallResponseHandler = async (req, res) => {
   const call: AppCallRequestWithValues = req.body;
   const mattemrostUrl: string | undefined = call.context.mattermost_site_url;
   const botAccessToken: string | undefined = call.context.bot_access_token;
   const values: AppCallValues = call.values;
   const i18nObj = configureI18n(call.context);

   const apiKey: string = values[ConfigureWorkspaceForm.TRELLO_APIKEY];
   const token: string = values[ConfigureWorkspaceForm.TRELLO_TOKEN];
   const workspace: string = values[ConfigureWorkspaceForm.TRELLO_WORKSPACE];

   const options: KVStoreOptions = {
      mattermostUrl: <string>mattemrostUrl,
      accessToken: <string>botAccessToken,
   };
   const kvStoreClient = new KVStoreClient(options);

   const trelloOptions: TrelloOptions = {
      apiKey,
      token,
   };
   const trelloClient: TrelloClient = new TrelloClient(trelloOptions);

   let callResponse: AppCallResponse;
   
   try {
      await tryPromise(trelloClient.validateToken(workspace), ExceptionType.TEXT_ERROR, i18nObj.__('api.configure.config_failed'));

      const kvProps: ConfigStoreProps = {
         trello_apikey: apiKey,
         trello_oauth_access_token: token,
         trello_workspace: workspace
      };
      await kvStoreClient.kvSet(StoreKeys.config, kvProps);

      callResponse = newOKCallResponseWithMarkdown(i18nObj.__('api.configure.config_success'));
      res.json(callResponse);
   } catch (error: any) {
      callResponse = showMessageToMattermost(error);
      res.json(callResponse);
   }
};
