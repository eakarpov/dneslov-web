import {memo, Suspense} from "react";
import {getRite} from "./api";
import Content from "./Content";

const RiteRoutePage = (props: { params: { uno: string } }) => {
    const ritePromise = getRite(props.params.uno);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <Content ritePromise={ritePromise} />
        </Suspense>
    );
};

export default memo(RiteRoutePage);
