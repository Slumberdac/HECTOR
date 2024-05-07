import Welcome from "./Welcome/Welcome";
import Pfp from "./User/Pfp.jsx";

const App = () => {
	return (
		<>
			<Pfp color="#2FC" eye={9} mouth={8} />
			<Welcome />
		</>
	);
};

export default App;
