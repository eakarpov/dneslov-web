import {Suspense} from "react";
import Navbar from "./common/Navbar";
import Calendar from "./components/Calendar/index";
import SourceList from "./components/SourceList/index";
import Content from "./Content";
import {getCalendaries} from "./api";

export default function Home() {
  const calendariesData = getCalendaries(1, 100);
  return (
    <div>
      <Navbar />
      <main className="flex m-4 w-full">
          <Suspense fallback={<div>Загрузка...</div>}>
              <Content itemsPromise={calendariesData} />
          </Suspense>
      </main>
    </div>
  );
}
