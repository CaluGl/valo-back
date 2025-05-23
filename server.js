import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/comparables", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Champ vide." });
  }

  const prompt = `Dans le cadre d’une valorisation d’entreprise, donne-moi une liste de 50 entreprises PUBLIQUES (cotées en bourse) comparables à : ${input}.
Assure-toi que les entreprises sélectionnées soient réellement comparables en termes de modèle économique, secteur d’activité, type de clientèle, et stade de développement. Ne mélange pas des startups early-stage avec des multinationales si ce n’est pas pertinent.

Uniquement des entreprises cotées. Pour chaque entreprise, indique :
1. Le nom de l’entreprise
2. Une courte description (1 ligne)
3. Son multiple d’EBITDA (si disponible), ou une estimation.
4. Son ticker et sa place de cotation (ex : NASDAQ, Euronext, etc.)

Format : liste numérotée avec ces 4 éléments pour chaque entreprise.`;


  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Réponse invalide de l'API OpenAI." });
    }

    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Backend Express opérationnel !");
});
