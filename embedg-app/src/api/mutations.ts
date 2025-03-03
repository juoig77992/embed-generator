import { useMutation } from "react-query";
import {
  GenerateMagicMessageRequestWire,
  GenerateMagicMessageResponseWire,
  MessageRestoreFromChannelRequestWire,
  MessageRestoreFromWebhookRequestWire,
  MessageRestoreResponseWire,
  MessageSendResponseWire,
  MessageSendToChannelRequestWire,
  MessageSendToWebhookRequestWire,
  SavedMessageCreateRequestWire,
  SavedMessageCreateResponseWire,
  SavedMessageDeleteResponseWire,
  SavedMessageUpdateResponseWire,
  SavedMessagesImportRequestWire,
  SavedMessagesImportResponseWire,
} from "./wire";
import { handleApiResponse } from "./queries";

export function useGenerateMagicMessageMutation() {
  return useMutation((req: GenerateMagicMessageRequestWire) => {
    return fetch(`/api/magic/message`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
      handleApiResponse<GenerateMagicMessageResponseWire>(res.json())
    );
  });
}

export function useSendMessageToChannelMutation() {
  return useMutation((req: MessageSendToChannelRequestWire) => {
    return fetch(`/api/send-message/channel`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => handleApiResponse<MessageSendResponseWire>(res.json()));
  });
}

export function useSendMessageToWebhookMutation() {
  return useMutation((req: MessageSendToWebhookRequestWire) => {
    return fetch(`/api/send-message/webhook`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => handleApiResponse<MessageSendResponseWire>(res.json()));
  });
}

export function useRestoreMessageFromWebhookMutation() {
  return useMutation((req: MessageRestoreFromWebhookRequestWire) => {
    return fetch(`/api/restore-message/webhook`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => handleApiResponse<MessageRestoreResponseWire>(res.json()));
  });
}

export function useRestoreMessageFromChannelMutation() {
  return useMutation((req: MessageRestoreFromChannelRequestWire) => {
    return fetch(`/api/restore-message/channel`, {
      method: "POST",
      body: JSON.stringify(req),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => handleApiResponse<MessageRestoreResponseWire>(res.json()));
  });
}

export function useCreatedSavedMessageMutation() {
  return useMutation(
    ({
      req,
      guildId,
    }: {
      req: SavedMessageCreateRequestWire;
      guildId: string | null;
    }) => {
      let url = `/api/saved-messages`;
      if (guildId) {
        url += `?guild_id=${guildId}`;
      }

      return fetch(url, {
        method: "POST",
        body: JSON.stringify(req),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) =>
        handleApiResponse<SavedMessageCreateResponseWire>(res.json())
      );
    }
  );
}

export function useUpdateSavedMessageMutation() {
  return useMutation(
    ({
      messageId,
      req,
      guildId,
    }: {
      messageId: string;
      req: SavedMessageCreateRequestWire;
      guildId: string | null;
    }) => {
      let url = `/api/saved-messages/${messageId}`;
      if (guildId) {
        url += `?guild_id=${guildId}`;
      }

      return fetch(url, {
        method: "PUT",
        body: JSON.stringify(req),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) =>
        handleApiResponse<SavedMessageUpdateResponseWire>(res.json())
      );
    }
  );
}

export function useDeleteSavedMessageMutation() {
  return useMutation(
    ({ messageId, guildId }: { messageId: string; guildId: string | null }) => {
      let url = `/api/saved-messages/${messageId}`;
      if (guildId) {
        url += `?guild_id=${guildId}`;
      }

      return fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) =>
        handleApiResponse<SavedMessageDeleteResponseWire>(res.json())
      );
    }
  );
}

export function useImportSavedMessagesMutation() {
  return useMutation(
    ({
      req,
      guildId,
    }: {
      req: SavedMessagesImportRequestWire;
      guildId: string | null;
    }) => {
      let url = `/api/saved-messages`;
      if (guildId) {
        url += `?guild_id=${guildId}`;
      }

      return fetch(url, {
        method: "PATCH",
        body: JSON.stringify(req),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) =>
        handleApiResponse<SavedMessagesImportResponseWire>(res.json())
      );
    }
  );
}
