export default {
    SERVER_URL: 'https://f452-2404-7c80-5c-d072-9c4b-b62f-1260-3a43.ngrok-free.app'
};

export const INTER_EVENTS = {
    GET_SESSION: "connexik:auth:getSession",
    SET_SESSION: "connexik:auth:setSession",
    OPEN_POPUP: "connexik:auth:openPopup"
}

export const SESSION_STATUS = {
    QUEUED: "queued",
    ACTIVE: "active",
    BLOCKED: "blocked"
}