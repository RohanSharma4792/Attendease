import { useCallback, useEffect, useState } from "react";
import client from "../../appwrite.config";
import { Teams, Databases, Query } from "appwrite";

export default function CreateMembershipLogic(teamId) {
  const [teamMembers, setTeamMembers] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  
  async function createMembership({
    eventId,
    teamId,
    userId,
    name,
    email,
    role,
    phone
  }) {
    
    if (typeof role !== "string") {
      throw new Error("Role must be a string value");
    }
    const teams = new Teams(client);
    const databases = new Databases(client);
    let phoneresponse = await databases.listDocuments(
      process.env.REACT_APP_DATABASE_ID,
      process.env.REACT_APP_PHONE_COLLECTION_ID,
    [
        Query.equal('email', email)
    ]
);
// let t = phoneresponse.documents[0].mobile
    const res = await teams.createMembership(
      teamId,
      typeof role === "undefined" || typeof role !== "string" ? [] : [role],
      `${process.env.REACT_APP_WEBSITE_URL}/accept-invite/${eventId}`,
      email,
      userId,
      phone,
      name,
      );
    
    setTeamMembers((prev) => [...prev, res]);
    setMemberCount((prev) => prev + 1);
    return res;
  }

  const getTeamMembers = useCallback(
    async (teamId) => {
      try {
        const teams = new Teams(client);
        const res = await teams.listMemberships(teamId);
        
        setMemberCount((prev) => res.total);
        setTeamMembers((prev) => res.memberships);
      } catch (err) {
        console.error(err);
      }
    },
    [teamId]
  );

  useEffect(() => {
    if (teamId) getTeamMembers(teamId);
  }, [getTeamMembers, teamId]);

  return {
    createMembership,
    teamMembers,
    memberCount,
  };
}
