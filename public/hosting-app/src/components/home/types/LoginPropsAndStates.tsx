export type LoginState = {
    status: 'NotAttempted' | 'LoggedIn' | 'WrongCredentials',
    userName: string,
    attemptCount : number,
    examineeId: string,
    userType: 'NotAttempted' | 'Candidate' | 'Admin'
}