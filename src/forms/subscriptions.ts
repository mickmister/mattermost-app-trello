import { getManifestData } from "../api/manifest";
import { ConfigStoreProps, KVStoreClient, KVStoreOptions } from "../clients/kvstore";
import { TrelloClient, TrelloOptions } from "../clients/trello";
import config from "../config";
import { AppExpandLevels, AppFieldTypes, Routes, StoreKeys, TrelloIcon } from "../constant";
import { AppCallRequest, AppForm, AppSelectOption } from "../types";
import { BoardSelected } from "../types/callResponses";
import { errorOpsgenieWithMessage, tryPromiseOpsgenieWithMessage, tryPromiseWithMessage } from "../utils";

export async function addSubscriptionForm(call: AppCallRequest): Promise<AppForm> {
   const kvOpts: KVStoreOptions = {
      mattermostUrl: call.context.mattermost_site_url || '',
      accessToken: call.context.bot_access_token || ''
   };

   const kvClient: KVStoreClient = new KVStoreClient(kvOpts);
   const trelloConfig: ConfigStoreProps = await kvClient.kvGet(StoreKeys.config) as ConfigStoreProps;
   
   const trelloOptions: TrelloOptions = {
      apiKey: trelloConfig.trello_apikey,
      token: trelloConfig.trello_oauth_access_token,
      workspace: trelloConfig.trello_workspace
   };

   const options: AppSelectOption[] = await getBoardOptionList(trelloOptions);

   return {
      app_id: getManifestData().app_id,
      title: 'New subscription',
      header: 'Subscribe a board to current channel',
      icon: TrelloIcon,
      fields: [
         {
            name: "board",
            modal_label: 'Select Board',
            type: AppFieldTypes.STATIC_SELECT,
            options: options,
            is_required: true,
         }
      ],
      submit_label: 'next',
      submit: {
         path: Routes.App.CallSubscriptionCreateWebhook,
         expand: {
            app: AppExpandLevels.EXPAND_ALL,
            channel: AppExpandLevels.EXPAND_ALL,
            admin_access_token: AppExpandLevels.EXPAND_ALL,
            user: AppExpandLevels.EXPAND_ALL,

            acting_user: AppExpandLevels.EXPAND_ALL,
            acting_user_access_token: AppExpandLevels.EXPAND_ALL,
            post: AppExpandLevels.EXPAND_ALL,
            root_post: AppExpandLevels.EXPAND_ALL,
         }
      },
   } as AppForm;
}


async function getBoardOptionList(trelloOptions: TrelloOptions): Promise<AppSelectOption[]> {
   const trelloClient: TrelloClient = new TrelloClient(trelloOptions);
   const boards = await trelloClient.searchBoardsInOrganization();
   const options: AppSelectOption[] = [...boards.map((b: any) => { return { label: b.name, value: b.id } })];

   return options;
}

export async function createWebhookForm(call: AppCallRequest, hookURL: string): Promise<any> {
   const board = (call.values as BoardSelected)?.board;
   const kvOpts: KVStoreOptions = {
      mattermostUrl: call.context.mattermost_site_url || '',
      accessToken: call.context.bot_access_token || ''
   };

   const kvClient: KVStoreClient = new KVStoreClient(kvOpts);
   const trelloConfig: ConfigStoreProps = await kvClient.kvGet(StoreKeys.config) as ConfigStoreProps;

   const trelloOptions: TrelloOptions = {
      apiKey: trelloConfig.trello_apikey,
      token: trelloConfig.trello_oauth_access_token,
      workspace: trelloConfig.trello_workspace
   };
   const trelloClient: TrelloClient = new TrelloClient(trelloOptions);
   const createWebhook = trelloClient.createTrelloWebhook(hookURL, board.value);
   try {
      await createWebhook;
      return {
         title: 'Configure Trello',
         header: 'Configure the Trello app with the following information.',
         icon: TrelloIcon,
         submit: {
            path: '',
         },
      } as AppForm;
   } catch (error: any) {
      throw new Error(errorOpsgenieWithMessage(error.response, `Unable to subscribe ${board.label} board`));
   }
}