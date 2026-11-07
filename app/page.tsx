import { BoasVindas } from "@/components/loja/boas-vindas";
import { getLoja } from "@/lib/catalogo";

export default function Inicio() {
  const loja = getLoja();
  return <BoasVindas nomeLoja={loja.nome} slogan={loja.slogan} />;
}
