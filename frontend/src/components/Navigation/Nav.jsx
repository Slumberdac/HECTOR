import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

import Logo from "../../assets/Logo";
import Pfp from "../User/Pfp";
import Head from "../../assets/pfps/head";
import QuestionMark from "../../assets/pfps/QuestionMark";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

function Nav() {
	// The signed-in user now comes from one shared source rather than each
	// component fetching it from a cookie-held id.
	const { user, isLoggedIn } = useAuth();

	const [color, setColor] = useState("#050604");
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className={`nav-container ${scrollY > 0 ? "scrolled" : ""}`}>
			<nav>
				<Link to="/">
					<Logo
						color={color}
						onMouseEnter={() => setColor("#222")}
						onMouseLeave={() => setColor("#050604")}
					/>
				</Link>
				<ul>
					<li>
						<Link to="/">
							<h1>Home</h1>
						</Link>
					</li>
					<li>
						<Link to="/users">
							<h1>Users</h1>
						</Link>
					</li>
					<li>
						<Link to="/rocks">
							<h1>Companions</h1>
						</Link>
					</li>
					<li>
						<Link to={isLoggedIn ? "/profile" : "/signin"}>
							<h1>{isLoggedIn ? "Profile" : "Sign In"}</h1>
						</Link>
					</li>
				</ul>
				{isLoggedIn ? (
					<Link to="/profile" className="nav-button">
						<Pfp
							color={user.pfp_color ?? "#999"}
							eyes={user.pfp_eyes ?? 1}
							mouth={user.pfp_mouth ?? 1}
						/>
					</Link>
				) : (
					<Link to="/signin" className="nav-button">
						<div className="missing-pfp">
							<Head color="#999999" />
							<QuestionMark color="#000" />
						</div>
					</Link>
				)}
			</nav>
			<Outlet />
		</div>
	);
}

export default Nav;
