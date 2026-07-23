/** Minimal user/session info returned by the backend `GET /api/auth/me`. */
export type UserSession = {
    username: string;
    session_id: string;
    exp: number;
};