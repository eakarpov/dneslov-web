import {memo} from "react";
import Image from "next/image";

const Navbar = () => {
    return (
        <div className="flex navbar">
            <Image
                src="/logo.png"
                alt="Logo"
                width={320}
                height={64}
                priority
            />
        </div>
    )
};

export default memo(Navbar);
