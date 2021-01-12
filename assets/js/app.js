const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    mensagemAlerta: "",
    possuiAtivo: false,
    carrinhoAtivo: false,
  },
  computed: {
    carrinhoTotal() {
      let total = 0;
      if(this.carrinho.length) {
        this.carrinho.forEach((item) => {
          total += item.preco;
        });
      }
      return total;
    }
  },
  methods: {
    async fetchProdutos() {
        const respondeFetch = await fetch("assets/api/produtos.json")
        const jsonFetch = await respondeFetch.json();
        this.produtos = jsonFetch;
      },
      async fetchProduto(id) {
        const responseFetch = await fetch(`assets/api/produtos/${id}/dados.json`);
        const jsonFetch = await responseFetch.json();
        this.produto = jsonFetch;
      },
      abrirModal(id) {
        this.fetchProduto(id);
        window.scroll({
          top:0,
          behavior: "smooth"
        });
      },
      fecharModal({target, currentTarget}) {
        if(target === currentTarget) this.produto = false;
        
      },
      adicionarItem() {
        this.produto.estoque--;
        const {id, nome, preco} = this.produto;
        this.carrinho.push({id, nome, preco});
        this.alerta(`${nome} foi adicionado ao carrinho.`)
      },
      removerItem(index) {
        this.carrinho.splice(index, 1);
      },
      checarLocalStorage() {
        if(window.localStorage.carrinho) {
          this.carrinho = JSON.parse(window.localStorage.carrinho);
        }
      },
      compararEstoque() {
        const items = this.carrinho.filter((item) =>{
          if(item.id === this.produto.id) {
            return true;
          }
          
        });
        console.log(items);
        this.produto.estoque = this.produto.estoque - items.length;
      },

      alerta(mensagem) {
        this.mensagemAlerta = mensagem;
        this.possuiAtivo = true;
        setTimeout(() => {
          this.possuiAtivo = false;
        }, 1700);
      },
      router() {
        const hash = document.location.hash;
        if(hash) {
          this.fetchProduto(hash.replace("#", ""));
        }
      },
      overlay() {
        const modalCarrinho = document.querySelector(".modal_carrinho");
        setTimeout(() => {
          if(modalCarrinho.classList.contains("ativo")) {
            modalCarrinho.style.position = "fixed";
            modalCarrinho.style.height = "100vh";
          } else {
            modalCarrinho.style.position = "static";
            modalCarrinho.style.height = "0";
          }  
        }, 200);
        this.carrinhoAtivo = !this.carrinhoAtivo;
      }
  },
  watch: {
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`);
      if(this.produto) {
        this.compararEstoque();
      }
    },

    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho)
    },
    modalCarrinho() {

    }
  }, 

  filters: {
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL"}
      );
    }
  },
  created() {
    this.fetchProdutos();
    this.router();
    this.checarLocalStorage();
  }, 
});
