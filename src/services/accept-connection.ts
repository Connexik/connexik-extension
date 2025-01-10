export const acceptFilterConnections = () => {
    const invitations = document.querySelectorAll("ul.mn-invitation-list>li");

    for(let invitation of invitations){
        const newsletter = invitation.getElementsByClassName("invitation-card__icon--newspaper");
        if(newsletter.length){
            continue;
        }

        
    }
}