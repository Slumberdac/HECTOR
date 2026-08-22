import Logo from "../../assets/Logo";
import Hector from "../../assets/hectorHimself.webp";
import "./Welcome.css";

function Welcome() {
	// The reveal used to be driven by a scroll listener, which meant nothing
	// happened until you scrolled past a tenth of the viewport, and on a tall
	// screen the panel fits without scrolling at all so it never fired. It is a
	// staged entrance now, run from CSS on mount: no listener, no re-render per
	// scroll frame, and it honours prefers-reduced-motion.
	return (
		<div className="welcome">
			<div className="welcome-logo">
				<h1>Welcome to</h1>
				<Logo color="#050604" />
				<p className="logo-text">
					<span className="cap">H</span>
					ector's
					<span className="cap">E</span>
					xtravagant
					<span className="cap">C</span>
					ontainement
					<span className="cap tight">T</span>
					errain
					<span className="cap">O</span>f
					<span className="cap">R</span>
					ocks
				</p>
				<p id="number-1">The World&apos;s #1 Pet Rock Registry</p>
			</div>
			<div className="welcome-content">
				<img src={Hector}></img>
				<p>
					Hector Garvin always stood out for his unconventional
					interests, but his passion for pet rocks catapulted him into
					a unique niche of entrepreneurial success. From a young age,
					Hector displayed an extraordinary fascination with geology,
					spending countless hours in the rocky plains near his home,
					collecting unusual stones that he believed carried their own
					distinctive personalities and stories. It was during these
					formative years that the seeds for HECTOR (Hector's
					Extravagant Containment Terrain Of Rocks), the world's
					premier pet rock registry, were sown.
					<br />
					<br />
					The concept of HECTOR germinated from Hector's desire to
					elevate the humble pet rock from a simple novelty item to a
					treasured collectible. He recognized early on that every
					rock could have a "pedigree" of sorts—unique characteristics
					like origin, mineral content, and even an imagined history.
					Hector's vision was to create a registry where these traits
					could be cataloged and celebrated, fostering a community of
					enthusiasts who shared his appreciation for these silent
					companions.
					<br />
					<br />
					The registry quickly gained momentum as it tapped into the
					nostalgic charm of pet rocks, appealing to both older
					generations who remembered the fad from their youth and
					younger people attracted by the eco-friendly and
					low-maintenance nature of rock pets. Hector's approach was
					meticulous and imbued with his trademark flair for the
					extravagant. Each registered rock received an official
					certificate, complete with a detailed biography and
					description.
					<br />
					<br />
					Hector's past, marked by his early isolation due to his
					unusual hobbies, turned into a narrative of triumph as he
					founded HECTOR. His enterprise not only provided him with a
					sense of purpose but also connected him with people
					worldwide, creating a community where quirks were
					celebrated, and everyone had a rock to lean on, literally.
					The success of HECTOR spoke volumes about the power of
					embracing one's passions, no matter how unconventional they
					might be. Hector had transformed a simple childhood
					fascination into a thriving global registry, bringing joy
					and a sense of belonging to people and their pet rocks
					everywhere.
				</p>
			</div>
		</div>
	);
}

export default Welcome;
