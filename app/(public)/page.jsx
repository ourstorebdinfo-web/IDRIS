import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Reviews />
        </div>
    );
}
