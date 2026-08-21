import {memo, Suspense} from "react";
import Navbar from "../common/Navbar";
import {getRites} from "./api";
import Content from "./Content";

const RitesRoutePage = () => {
    const ritesPromise = getRites();

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content ritesPromise={ritesPromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(RitesRoutePage);
