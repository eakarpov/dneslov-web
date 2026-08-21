import {memo, Suspense} from "react";
import Navbar from "../../common/Navbar";
import {getRite} from "./api";
import Content from "./Content";

const RiteRoutePage = (props: { params: { uno: string } }) => {
    const ritePromise = getRite(props.params.uno);

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content ritePromise={ritePromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(RiteRoutePage);
