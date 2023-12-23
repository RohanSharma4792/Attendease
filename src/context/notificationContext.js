import { createContext, useCallback, useContext, useEffect, useState } from "react";
import client from "../appwrite.config";
import { Databases, ID, Query } from "appwrite";
import NotificationSound from '../assets/notification.mp3'

const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
    
    const [show, setShow] = useState(false);
    const [notifications, setNotifications] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const toggleNotificationBar = (e) => {
        e?.preventDefault();
        setShow(prev => !prev);
        setUnreadNotifications(prev => 0);
    }

    const sendNotification = useCallback(async (data) => {
        try {
            const db = new Databases(client);
            const res = await db.createDocument(
                '6586a037e0c947f6af3f',
                '6586a15e89d7781014ab',
                ID.unique(),
                data
            );
            
        } catch (err) {
            console.error(err);
        }
    }, []);


    const fetchNotifications = useCallback(async () => {
        try {
            const db = new Databases(client);
            const res = await db.listDocuments(
                '6586a037e0c947f6af3f',
                '6586a15e89d7781014ab',
                [
                    Query.equal('userId', JSON.parse(localStorage.getItem('spotlight-user'))?.$id),
                    Query.orderDesc('$updatedAt')
                ]
            );
            
            setNotifications(prev => res.documents);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s))

    


    useEffect(() => {
        
        client.subscribe(`databases.${'6586a037e0c947f6af3f'}.collections.${'6586a15e89d7781014ab'}.documents`, (res) => {
            
            if(res.payload?.userId !== JSON.parse(localStorage.getItem('spotlight-user'))?.$id) return;
            setNotifications(prev => uniqueArray([res.payload, ...prev]));
            if(!show) {
                setUnreadNotifications(prev => uniqueArray([res.payload]).length);
            }
            const audio = new Audio(NotificationSound);
            audio.play();
        })
    })

    const value = {
        show,
        toggleNotificationBar,
        sendNotification,
        notifications,
        unreadNotifications
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    return useContext(NotificationContext);
}