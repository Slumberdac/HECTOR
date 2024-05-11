import React from "react";
import "./RocksRegistry.css"

export default function RocksRegistry() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const localStorage = LocalStorage();

	useEffect(() => {
		setSearchResults(
			localStorage
				.getGames()
				.filter((game) =>
				  game.title.toLowerCase().includes(searchQuery.toLowerCase())
				)
		);
	  }, [
		searchQuery,
		localStorage.getGames(),
	  ]);


	return (
		<div>
      <div className="search-bar">
        <ReactSVG src={glass} className={styles.glass} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ReactSVG src={funnel} className={styles.funnel} />
      </div>
        {searchingGames && (
          <div>
            <span data-tooltip="Update" data-flow="top">
              <button className="update" onClick={update}>
                Remove
              </button>
            </span>
          </div>
        )}
      <div className="search-results">
        <ul className="items">
          {searchResults.map((result) =>
            searchingGames ? (
              <li id={result.id} className="item">
                <GameCard game={result} />
              </li>
            ) : (
              <li id={result.id}>
                <UserCard user={result} />
              </li>
            )
          )}
          {searchingGames && (
            <li>
              <span data-tooltip="Add a Game" data-flow="top">
                <button className="add-game" onClick={add}>
                  +
                </button>
              </span>
            </li>
          )}
        </ul>
      </div>
      <button onClick={() => setSearchingGames(!searchingGames)}>
        {searchingGames ? "Search for Users" : "Search for Games"}
      </button>
    </div>
	);
}
