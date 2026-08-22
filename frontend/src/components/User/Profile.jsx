import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Pfp from "./Pfp";
import RockCard from "../Rock/RockCard";
import { users, randomAvatar } from "../../api/hector";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

export default function Profile() {
	const { user, setUser, signOut, loading, isLoggedIn } = useAuth();
	const navigate = useNavigate();

	const [rocks, setRocks] = useState([]);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!user) return undefined;
		const controller = new AbortController();
		users
			.rocks(user._id, { signal: controller.signal })
			.then((data) => setRocks(data.rocks))
			.catch((err) => {
				if (err.name !== "AbortError") setError(err.message);
			});
		return () => controller.abort();
	}, [user]);

	if (loading) return <p className="profile-container">Loading…</p>;
	if (!isLoggedIn) return <Navigate to="/signin" replace />;

	const rerollAvatar = async () => {
		setBusy(true);
		setError("");
		try {
			const data = await users.update(user._id, randomAvatar());
			// Update state in place instead of reloading the page.
			setUser(data.user);
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	};

	const deleteAccount = async () => {
		if (
			!window.confirm(
				"Are you sure you want to delete your account? Your companions will be released."
			)
		) {
			return;
		}
		setBusy(true);
		try {
			await users.remove(user._id);
			await signOut();
			navigate("/");
		} catch (err) {
			setError(err.message);
			setBusy(false);
		}
	};

	const handleSignOut = async () => {
		await signOut();
		navigate("/");
	};

	return (
		<div className="profile-container">
			<Pfp
				color={user.pfp_color ?? "#999"}
				eyes={user.pfp_eyes ?? 1}
				mouth={user.pfp_mouth ?? 1}
			/>
			<div className="profile-info">
				<h1>Profile</h1>
				<h2>Name: {user.name}</h2>
				<h2>Username: {user.username}</h2>
				{error && (
					<p className="error" role="alert">
						{error}
					</p>
				)}
				<div className="buttons">
					<button onClick={rerollAvatar} disabled={busy}>
						Reroll PFP
					</button>
					<button onClick={handleSignOut} disabled={busy}>
						Sign Out
					</button>
					<button onClick={deleteAccount} disabled={busy}>
						Delete Account
					</button>
				</div>
			</div>
			<h2 id="your-rocks">Your Rocks</h2>
			<div className="rock-card-container-profile">
				<ul>
					{rocks.map((rock) => (
						<RockCard key={rock._id} rock={rock} profile={true} />
					))}
				</ul>
			</div>
		</div>
	);
}
