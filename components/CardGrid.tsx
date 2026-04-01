import { InsuranceCard } from "@/lib/types";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: InsuranceCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </section>
  );
}
