import Welcome from "./Welcome/Welcome";
import Pfp from "./User/Pfp";
import Nav from "./Navigation/Nav";
import "./App.css";
const App = () => {
	return (
		<>
			<Pfp color="#999999" eye={15} mouth={8} />
			<Nav />
			<Welcome />
		</>
	);
};

export default App;
