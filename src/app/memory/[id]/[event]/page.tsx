import {memo, Suspense} from "react";
import Navbar from "../../../common/Navbar";
import {getEvent} from "./api";
import Content from "./Content";

const EventRoutePage = (props: { params: { id: string; event: string } }) => {
    const eventPromise = getEvent(props.params.id, props.params.event);

    return (
        <div>
            <Navbar />
            <main className="flex m-4 w-full">
                <Suspense fallback={<div>Загрузка...</div>}>
                    <Content eventPromise={eventPromise} memorySlug={props.params.id} />
                </Suspense>
            </main>
        </div>
    );
};

export default memo(EventRoutePage);
