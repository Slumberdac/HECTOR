import Welcome from "./Welcome/Welcome";
import Pfp from "./User/Pfp";

const App = () => {
	return (
		<>
			<Pfp color="#999999" eye={13} mouth={8} />
			<Welcome />
		</>
	);
};

export default App;
