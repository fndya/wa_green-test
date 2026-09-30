
const BASE_URL = "https://7201.api.green-api.com";

function getUrl(idInstance, apiTokenInstance, method) {
  if (!idInstance?.trim() || !apiTokenInstance?.trim()) {
    throw new Error("Укажи ID инстанса и API Token Instance");
  }

  return `${BASE_URL}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Ошибка API: ${response.status}`
    );
  }

  return data;
}

export const greenApi = {
  getState({ idInstance, apiTokenInstance }) {
    return request(
      getUrl(idInstance, apiTokenInstance, "getStateInstance")
    );
  },

  sendMessage({ idInstance, apiTokenInstance, chatId, message }) {
    if (!chatId || !/^\d+@c\.us$/.test(chatId)) {
      throw new Error("Некорректный chatId");
    }

    if (!message?.trim()) {
      throw new Error("Сообщение не должно быть пустым");
    }

    return request(
      getUrl(idInstance, apiTokenInstance, "sendMessage"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: message.trim(),
        }),
      }
    );
  },

  receiveNotification({ idInstance, apiTokenInstance }) {
    return request(
      getUrl(idInstance, apiTokenInstance, "receiveNotification")
    );
  },

  deleteNotification({ idInstance, apiTokenInstance, receiptId }) {
    return request(
      `${getUrl(idInstance, apiTokenInstance, "deleteNotification")}/${receiptId}`,
      {
        method: "DELETE",
      }
    );
  },
};
