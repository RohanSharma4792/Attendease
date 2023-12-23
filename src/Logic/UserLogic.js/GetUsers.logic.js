import { useState, useEffect, useCallback } from "react";
import client from "../../appwrite.config";
import { Databases, Query } from "appwrite";
import { toast } from "react-hot-toast";


function GetUsersLogic() {
    const [users,setUsers] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showUsers, setShowUsers] = useState(null)
    
    const toggleShowUsers = useCallback(() => {
        setShowUsers(prev => !prev)
    }, [])

    const getUsers = useCallback(async () => {
        setLoading(prev => true)
        try {
            const database = new Databases(client);
            const response = await database.listDocuments(
                '6586a037e0c947f6af3f',
                '6586a15e89d7781014ab',
                [
                    Query.notEqual('userId', JSON.parse(localStorage.getItem('token')).userId)
                ]
            );
            setUsers(prev => response?.documents);
        }
        catch (err) {
            setError(prev => err.message)
            
            toast.error(err.message)
        }
        finally {
            setLoading(prev => false)
        }
    }, [])

    useEffect(() => {
        getUsers()
    }, [getUsers])

    return {
        users,
        showUsers,
        loading,
        error,
        toggleShowUsers
    }
}

export default GetUsersLogic;