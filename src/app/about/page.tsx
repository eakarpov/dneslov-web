import {memo} from "react";
import Navbar from "../common/Navbar";
import AboutPage from "./AboutPage";

const AboutRoutePage = () => {
    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <AboutPage />
            </main>
        </div>
    );
};

export default memo(AboutRoutePage);
