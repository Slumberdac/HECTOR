import Welcome from "./Welcome/Welcome";
import Pfp from "./User/Pfp";
import Nav from "./Navigation/Nav";
import "./App.css";
const App = () => {
	return (
		<>
			<Pfp color="#2FC" eye={9} mouth={8} />
			<Nav />
			<Welcome />
		</>
	);
};

export default App;
