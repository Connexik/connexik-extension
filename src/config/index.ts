export default {
    SERVER_URL: 'https://api.connexik.com'
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