import "./Footer.css";

export const Footer = () => {
    return (
        <footer>
            <button id="scroll" onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) }}>
                Scroll to top
            </button>
            All rights reserved &copy;</footer>
    );
};