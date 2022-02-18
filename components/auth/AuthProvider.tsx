import React, { useState, useEffect, useContext } from 'react'
import { firebase } from '../../firebase/firebaseClient'
import nookies from 'nookies'

const AuthContext = React.createContext<{ user: firebase.User | null }>({
    user: null
})

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<firebase.User | null>(null)

    //auth logic
    // listen for token changes
    // call setUser and write new token as a cookiex
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {
                setUser(null)
                nookies.set(undefined, 'token', '', { path: '/' })
            } else {
                const token = await user.getIdToken();
                setUser(user);
                nookies.set(undefined, 'token', token, { path: '/' })
            }
        })
    }, [])

    // force refresh the token every 10 minutes
    useEffect(() => {
        const handle = setInterval(async () => {
            const user = firebase.auth().currentUser
            if (user) await user.getIdToken(true)
        }, 10 * 60 * 1000)

        // clean up setInterval
        return () => clearInterval(handle)
    }, [])



    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};