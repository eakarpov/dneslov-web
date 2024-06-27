import {memo, Suspense} from "react";
import Navbar from "../../common/Navbar";
import {getItem} from "./api";
import Content from "./Content";

const MemoryPage = (props) => {
    const itemPromise = getItem(props.params.id as string);

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content itemPromise={itemPromise} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(MemoryPage);
