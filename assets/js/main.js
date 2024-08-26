/* Código feito primariamente em ingles para boas praticas no entanto comentarios feitos em portugues devido a praticidade e foco do projeto ser didatico
 */

/* Code made primarily in English for good practices however comments made in Portuguese due to the practicality and focus of the project is didactic */

//Carrega os princiapis container que serão utilizados pelo app
const pokemonContainer = document.getElementById("pokemon-container");
const screenOverlayContainer = document.getElementById("screen-overlay");

//A lista de quais pokemons foram carregado
//Criado para evitar request denecessarios a PokeAPI
const loadedPokemons = [];

// Paramentros para o request da pokeAPI
let nextPokemonList = undefined; // Salva o link para a próxima request
let currentLimit = 15; // Quantidade de pokemons em cada request

//Variavel que controla se já existe um request por novos pokemons
let loadingNewPokemon = false;

//Define a função de click que ira esconder a sobreposição de tela quando ativa
screenOverlayContainer.addEventListener("click", hideScreenOverlay);

//Habilita scroll inifinito, ao chegar a certo ponto da tela ira requisitar mais pokemons a PokeAPI
window.addEventListener("scroll", function () {
  const documentHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop + windowHeight + 100 >= documentHeight) {
    loadNewPokemons();
  }
});

//Realiza o primeiro carregamento dos pokemons
loadNewPokemons();

//Função responsável por carregar novos pokemons e criar seus containers
function loadNewPokemons() {
  //Cancela solicitação caso já esteja sendo feito o carregamento de mais pokemons
  if (loadingNewPokemon) return;
  loadingNewPokemon = true;
  //Verifica se já foi realizado um fetch e atribui o link do próximo ou de um novo link padrão
  const fetchLink =
    nextPokemonList ||
    `https://pokeapi.co/api/v2/pokemon/?limit=${currentLimit}&offset=0`;

  //Solicita a PokeApi a lista de pokemons e então cria um novo pokemon para cada item da lista
  fetchPokemonApiData(fetchLink, (pokemonData) => {
    nextPokemonList = pokemonData.next;
    pokemonData.results.forEach((pokemon) => {
      fetchPokemonApiData(pokemon.url, addNewPokemon);
    });

    //finaliza o carregamento da nova lista de pokemons
    loadingNewPokemon = false;
  });
}

function addNewPokemon(pokemon) {
  //Cria os elementos de um novo pokemon
  const pokemonDiv = document.createElement("div");
  const pokemonName = document.createElement("h3");
  const pokemonImg = document.createElement("img");
  const pokemonTypes = document.createElement("div");

  //Adiciona os elementos criados ao elemento pokemonDiv que é a raiz de todo novo pokemon
  pokemonDiv.appendChild(pokemonName);
  pokemonDiv.appendChild(pokemonImg);
  pokemonDiv.appendChild(pokemonTypes);

  //Altera os valores dos elementos do pokemon com base no pokemon passado.
  pokemonName.innerText = pokemon.name;
  pokemonImg.src = pokemon.sprites.other["official-artwork"].front_default;
  pokemonDiv.className = `pokemon ${pokemon.types[0].type.name}`;
  pokemonDiv.setAttribute("pokemon-id", pokemon.id);
  //Adiciona um eventListener ao div para que ao clicka nele seja mostrado a sobreposição.
  pokemonDiv.addEventListener("click", showScreenOverlay);
  //Adiciona o pokemon a lista de pokemons já carregados
  loadedPokemons.push(pokemon);

  //Cria um elemente img e atribui a img e o alt com base no tipo passado
  const addPokemonType = (type) => {
    //Cria elemento elemento da img
    let newType = document.createElement("img");

    //attribui src
    newType.src =
      type.sprites["generation-viii"][
        "brilliant-diamond-and-shining-pearl"
      ].name_icon;

    //atribui alt
    newType.alt = type.name;
    //Adiciona ao elemento pokemonTypes a img criada
    pokemonTypes.appendChild(newType);
  };

  //Interpola por todos os elementos de pokemon type e cria um novo elemento type
  pokemon.types.forEach((type) => {
    fetchPokemonApiData(type.type.url, addPokemonType);
  });

  //Adiciona o novo pokemon ao pokemonCOntainer
  pokemonContainer.appendChild(pokemonDiv);
}

//Função responsavel por mostrar a sobreposição na tela
//A sobreposição fica responsavel por mostrar as informações adicionais do pokemon ao usuario
function showScreenOverlay(event) {
  //Pega o id do pokemon com relação a pokedex do elemento clickado
  const targetPokemonId = event.currentTarget.getAttribute("pokemon-id");

  //valor da pokedex é 1 valor acima do valor da array que armazena os pokemons carregados
  const pokemon = loadedPokemons[targetPokemonId - 1];

  //Verifica se o pokemon foi encontrado antes de mostrar a sobreposição
  if (pokemon) {
    //Carrega os elementos da sobreposição
    const overlayPokemonContainer = screenOverlayContainer.children[0];
    const pokemonName = overlayPokemonContainer.children[0];
    const pokemonImg = overlayPokemonContainer.children[1].children[0];
    const pokemonDescription = overlayPokemonContainer.children[2];

    //Atribui valores atrelados ao pokemon
    pokemonName.innerHTML = pokemon.name;
    pokemonImg.src = pokemon.sprites.other["official-artwork"].front_default;
    pokemonImg.alt = pokemon.name;

    //Verifica se o texto a ser mostrado está em ingles antes de definir a descrição.
    const changeDrescription = (pokemonSpecies) => {
      const flavor_text_entries = pokemonSpecies.flavor_text_entries;
      const entry = flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );
      if (entry) {
        pokemonDescription.innerText = entry.flavor_text
          .replace(/\f/g, " ")
          .replace(/\n/g, " ");
      }
    };

    //Solicita a PokeApi pela informações da especie do pokemon
    fetchPokemonApiData(pokemon.species.url, changeDrescription);

    //Altera os valores de visibilidade dos elementos principais
    screenOverlayContainer.style.visibility = "visible";
    pokemonContainer.style.visibility = "hidden";
  } else {
    //Notifica no console se algum pokemon não foi encontrado
    console.log("Pokemon not found.");
  }
}

function hideScreenOverlay(event) {
  //Altera os valores de visibilidade dos elementos principais
  screenOverlayContainer.style.visibility = "hidden";
  pokemonContainer.style.visibility = "visible";
}

//função asincrona que realiza a requisições a pokeAPI
//Deve receber uma URL que será utilizado para realiza a requisição
//Deve receber um callback que realizara o tratamento do json recebido da requisição
//Pode receber um tratamento de erro, caso não receba utiliza tratamento padrão de enviar o erro ao console.
async function fetchPokemonApiData(
  url,
  callback = (jsonData) => {},
  errorCallback = (error) => {
    console.log(error);
  }
) {
  try {
    const response = await fetch(url);
    const jsonData = await response.json();
    callback(jsonData);
  } catch (error) {
    errorCallback(error);
  }
}
