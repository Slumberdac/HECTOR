import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Hammer from "../../assets/Hammer.jsx";
import Missing from "../../assets/MissingImage.jsx";
import { rocks as rocksApi, users } from "../../api/hector";
import { useAuth } from "../../context/AuthContext";
import "./Rock.css";

const Rock = () => {
	const { rid } = useParams();
	const navigate = useNavigate();
	const { user, isLoggedIn } = useAuth();

	const [rock, setRock] = useState(null);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [busy, setBusy] = useState(false);

	const load = useCallback(
		(signal) =>
			rocksApi
				.get(rid, { signal })
				.then((data) => setRock(data.rock))
				.catch((err) => {
					if (err.name !== "AbortError") setError(err.message);
				}),
		[rid]
	);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	if (error) {
		return (
			<div className="rock-container">
				<h1>{error}</h1>
			</div>
		);
	}
	if (!rock) {
		return (
			<div className="rock-container">
				<h1>Loading…</h1>
			</div>
		);
	}

	const isOwner = isLoggedIn && rock.owner === user._id;
	const canDelete =
		isLoggedIn && (rock.owner === user._id || rock.createdBy === user._id);

	const run = async (action, successMessage) => {
		setBusy(true);
		setError("");
		setNotice("");
		try {
			await action();
			setNotice(successMessage);
			await load();
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async () => {
		if (!window.confirm("Are you sure you want to delete this rock?")) {
			return;
		}
		setBusy(true);
		try {
			await rocksApi.remove(rock._id);
			navigate("/rocks");
		} catch (err) {
			setError(err.message);
			setBusy(false);
		}
	};

	return (
		<div>
			<div className="rock-container">
				<div className="rock-info">
					<h1 id="name">{rock.name}</h1>
					{rock.image ? (
						<img src={rock.image} alt={rock.name} />
					) : (
						<Missing />
					)}
					<h2 id="gender">Gender: {rock.gender}</h2>
					<h3 id="personnality">{rock.personality}</h3>
					<p id="description">{rock.description}</p>
					{notice && <p className="notice">{notice}</p>}
					{error && (
						<p className="error" role="alert">
							{error}
						</p>
					)}
					<div className="buttons">
						{!rock.owner && isLoggedIn && (
							<button
								className="adopt-button"
								disabled={busy}
								onClick={() =>
									run(
										() => users.adopt(user._id, rock._id),
										`${rock.name} found; the way home`
									)
								}
							>
								Adopt
							</button>
						)}
						{isOwner && (
							<button
								className="abandon-button"
								disabled={busy}
								onClick={() =>
									run(
										() => users.release(user._id, rock._id),
										`${rock.name} will find; another way home`
									)
								}
							>
								Abandon
							</button>
						)}
						{canDelete && (
							<button
								className="delete-button"
								disabled={busy}
								aria-label="Delete this companion"
								onClick={handleDelete}
							>
								<Hammer />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Rock;
