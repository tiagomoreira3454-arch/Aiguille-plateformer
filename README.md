# Aiguille — prototype de plateforme d'action 2D

Prototype de jeu d'exploration et de combat nerveux, réalisé avec **Phaser 3** et
JavaScript moderne. Les visuels sont des formes colorées générées par le code :
aucun asset externe n'est nécessaire.

## Prérequis et lancement

- Node.js 18 ou supérieur
- npm

Depuis la racine du projet :

```bash
npm.cmd install
npm.cmd run dev
```

Ouvrez ensuite l'adresse indiquée par Vite (généralement
<http://localhost:5173>). Pour créer une version de production :

```bash
npm.cmd run build
npm.cmd run preview
```

> Dans PowerShell, utilisez `npm.cmd` plutôt que `npm` si la politique
> d'exécution bloque le script `npm.ps1`.

## Créer l'exécutable Windows

Après avoir installé les dépendances, créez l'installateur Windows avec :

```powershell
npm.cmd run dist:win
```

L'installateur `.exe` sera généré dans le dossier `release/`. Il permet
d'installer le jeu et de créer un raccourci sur le bureau. L'exécutable peut
être construit sur Windows ; il embarque le jeu et n'a pas besoin de Node.js
sur l'ordinateur où il est installé.

Pour lancer la version de bureau depuis le projet sans créer l'installateur,
exécutez d'abord `npm.cmd run build`, puis `npm.cmd run app`.

## Commandes

| Action | Commandes |
| --- | --- |
| Se déplacer | `A` / `D` ou flèches gauche / droite |
| Sauter, puis sauter une seconde fois | `Espace`, `W` ou flèche haut |
| Dash horizontal ou diagonal | `Maj` |
| Attaque à l'aiguille au corps à corps | `J` |
| Lancer une aiguille (consomme de la soie) | `K` |
| Attaque plongeante / pogo | `S` ou flèche bas + `J` |

Maintenir le bouton de saut augmente la hauteur du premier saut. Près d'un mur,
maintenir la direction vers celui-ci ralentit la chute ; sauter permet alors
d'effectuer un saut mural.

## Architecture

```text
index.html
electron/
  main.cjs                Fenêtre de bureau Electron
src/
  effects/
    ForestEffects.js      Parallaxe, lucioles, feuilles et particules de choc
  main.js                 Configuration Phaser et point d'entrée
  rendering/
    PixelArt.js           Spritesheets et animations dessinés en pixel art
  scenes/
    LevelScene.js         Orchestration du monde, combat et collisions
  entities/
    Player.js             Déplacements, combat, ressources et projectiles
    Enemy.js              Ennemi de patrouille et points de vie
    Trap.js               Obstacle dangereux et surface de pogo
  ui/
    HUD.js                Affichage des points de vie et de la soie
  world/
    ForestTilemap.js      Carte de quatre salles connectées et tuiles
electron/
  main.cjs                Fenêtre de bureau et vérification des mises à jour
  update-config.json      Dépôt GitHub utilisé par l'auto-updater
  style.css
```

`LevelScene` assemble les entités et les surfaces de collision. `Player` gère
ses entrées et expose son état au `HUD`. Les ennemis et pièges restent séparés
du contrôleur afin de pouvoir ajouter d'autres comportements sans alourdir le
point d'entrée. La carte utilise un calque de collision Tilemap plutôt que de
créer un objet physique par tuile. Les sprites 64 × 64, les animations, les
textures de terrain et l'éclairage d'ambiance sont générés par le code : les
assets peuvent être remplacés progressivement sans modifier la logique du jeu.

## Mécaniques incluses

- Course latérale, saut à hauteur variable, double saut, dash horizontal ou
  diagonal et saut mural.
- Attaque de mêlée, projectile consommant de la soie et attaque plongeante
  permettant de rebondir sur un ennemi ou un piège.
- Santé, dégâts avec invulnérabilité temporaire et soie récupérée en touchant
  un ennemi.
- Forêt à défilement horizontal de quatre salles connectées, avec terrain
  Tilemap, plateformes, ennemis et pièges.
- Fond en parallaxe à plusieurs profondeurs, rayons diffus, lucioles, feuilles
  tombantes, poussière d'atterrissage et traînée du dash.
- Animations pixel art de repos, course, saut, chute, dash et attaque.

## Configurer l'auto-updater GitHub

L'installateur standard (`npm.cmd run dist:win`) fonctionne sans compte GitHub
et ne publie rien. Pour distribuer des mises à jour automatiques :

1. Créez un dépôt **public** GitHub pour le projet et poussez-y le code.
2. Confirmez que `build.publish` dans `package.json` et `owner` / `repo` dans
   `electron/update-config.json` correspondent au dépôt public. La configuration
   actuelle vise `tiagomoreira3454-arch/Aiguille-plateformer`.
3. Créez un jeton GitHub disposant des droits de publication de releases
   (`Contents: read and write`). Dans PowerShell, définissez-le seulement pour
   la session de publication :

   ```powershell
   $env:GH_TOKEN = "votre-jeton"
   npm.cmd run publish:win
   ```

   Electron Builder crée une release GitHub et y publie l'installateur ainsi
   que le manifeste `latest.yml`. Ne placez jamais le jeton dans les fichiers
   du projet et ne le commitez pas.
4. Après la première publication réussie, passez `"enabled": false` à
   `"enabled": true` dans `electron/update-config.json`, reconstruisez et
   publiez l'installateur initial avec une nouvelle version. Cette version
   installée pourra ensuite détecter les versions suivantes.
5. Pour chaque mise à jour, augmentez `version` dans `package.json` (par
   exemple `1.0.1`), puis relancez `npm.cmd run publish:win`. L'application
   installée vérifie les releases au démarrage. Lorsqu'une version plus
   récente est trouvée, elle télécharge la mise à jour puis redémarre pour
   l'installer.

L'auto-updater est volontairement désactivé tant que le dépôt n'est pas
configuré. Il ne vérifie les mises à jour que pour l'application empaquetée ;
le lancement de développement reste inchangé.
