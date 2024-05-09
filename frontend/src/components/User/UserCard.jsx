import "./UserCard.css";
import Card from "../Card/Card.jsx";
import Pfp from "./Pfp.jsx";

const UserCard = ({ user }) => {
	return (
		<li className="user-card">
			<Card className="user-card-container">
				<Pfp
					eyes={user.pfp_eyes}
					mouth={user.pfp_mouth}
					color={user.pfp_color}
				/>

				<h3 id="username">{user.username}</h3>
			</Card>
		</li>
	);
};

export default UserCard;
