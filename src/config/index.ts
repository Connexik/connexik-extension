export default {
    SERVER_URL: 'https://a4f3-2404-7c80-5c-d072-640a-2ed9-8604-34d1.ngrok-free.app'
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