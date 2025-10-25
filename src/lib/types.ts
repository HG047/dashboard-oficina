// Classes e tipos para o sistema de oficina mecânica

// Classe Cliente
export class Cliente {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
  dataCadastro: Date
  veiculos: Veiculo[]

  constructor(
    nome: string,
    cpf: string,
    telefone: string,
    email: string,
    endereco: string
  ) {
    this.id = Date.now().toString()
    this.nome = nome
    this.cpf = cpf
    this.telefone = telefone
    this.email = email
    this.endereco = endereco
    this.dataCadastro = new Date()
    this.veiculos = []
  }

  adicionarVeiculo(veiculo: Veiculo): void {
    this.veiculos.push(veiculo)
  }

  removerVeiculo(placaVeiculo: string): void {
    this.veiculos = this.veiculos.filter(v => v.placa !== placaVeiculo)
  }

  buscarVeiculoPorPlaca(placa: string): Veiculo | undefined {
    return this.veiculos.find(v => v.placa === placa)
  }
}

// Classe Veículo
export class Veiculo {
  placa: string
  marca: string
  modelo: string
  ano: number
  cor: string
  combustivel: string
  quilometragem: number
  clienteId: string

  constructor(
    placa: string,
    marca: string,
    modelo: string,
    ano: number,
    cor: string,
    combustivel: string,
    quilometragem: number,
    clienteId: string
  ) {
    this.placa = placa
    this.marca = marca
    this.modelo = modelo
    this.ano = ano
    this.cor = cor
    this.combustivel = combustivel
    this.quilometragem = quilometragem
    this.clienteId = clienteId
  }

  atualizarQuilometragem(novaQuilometragem: number): void {
    this.quilometragem = novaQuilometragem
  }
}

// Classe Histórico de Serviços
export class HistoricoServico {
  id: string
  clienteId: string
  placaVeiculo: string
  dataServico: Date
  descricaoServico: string
  pecasUtilizadas: PecaUtilizada[]
  maoDeObra: number
  valorPecas: number
  valorTotal: number
  mecanico: string
  observacoes: string
  status: 'em_andamento' | 'concluido' | 'cancelado'

  constructor(
    clienteId: string,
    placaVeiculo: string,
    descricaoServico: string,
    maoDeObra: number,
    mecanico: string,
    observacoes: string = ''
  ) {
    this.id = Date.now().toString()
    this.clienteId = clienteId
    this.placaVeiculo = placaVeiculo
    this.dataServico = new Date()
    this.descricaoServico = descricaoServico
    this.pecasUtilizadas = []
    this.maoDeObra = maoDeObra
    this.valorPecas = 0
    this.valorTotal = maoDeObra
    this.mecanico = mecanico
    this.observacoes = observacoes
    this.status = 'em_andamento'
  }

  adicionarPeca(peca: PecaUtilizada): void {
    this.pecasUtilizadas.push(peca)
    this.calcularValorTotal()
  }

  removerPeca(nomePeca: string): void {
    this.pecasUtilizadas = this.pecasUtilizadas.filter(p => p.nome !== nomePeca)
    this.calcularValorTotal()
  }

  private calcularValorTotal(): void {
    this.valorPecas = this.pecasUtilizadas.reduce((total, peca) => {
      return total + (peca.preco * peca.quantidade)
    }, 0)
    this.valorTotal = this.maoDeObra + this.valorPecas
  }

  concluirServico(): void {
    this.status = 'concluido'
  }

  cancelarServico(): void {
    this.status = 'cancelado'
  }

  // Método estático para buscar histórico por cliente
  static buscarPorCliente(historicos: HistoricoServico[], nomeCliente: string, clientes: Cliente[]): HistoricoServico[] {
    const cliente = clientes.find(c => c.nome.toLowerCase().includes(nomeCliente.toLowerCase()))
    if (!cliente) return []
    
    return historicos.filter(h => h.clienteId === cliente.id)
  }

  // Método estático para buscar histórico por placa
  static buscarPorPlaca(historicos: HistoricoServico[], placa: string): HistoricoServico[] {
    return historicos.filter(h => h.placaVeiculo.toLowerCase().includes(placa.toLowerCase()))
  }

  // Método estático para buscar histórico por cliente OU placa
  static buscarHistorico(historicos: HistoricoServico[], termo: string, clientes: Cliente[]): HistoricoServico[] {
    // Primeiro tenta buscar por placa
    const porPlaca = this.buscarPorPlaca(historicos, termo)
    
    // Se não encontrou por placa, busca por nome do cliente
    if (porPlaca.length === 0) {
      return this.buscarPorCliente(historicos, termo, clientes)
    }
    
    return porPlaca
  }
}

// Interface para peças utilizadas no serviço
export interface PecaUtilizada {
  nome: string
  quantidade: number
  preco: number
  fornecedor: string
}

// Interfaces para compatibilidade com o sistema existente
export interface Vehicle {
  id: string
  plate: string
  model: string
  owner: string
  phone: string
  service: string
  status: 'waiting' | 'in-progress' | 'completed' | 'delivered'
  entryDate: string
  estimatedCompletion?: string
  totalCost: number
}

export interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  price: number
  supplier: string
}

// Dados mock para demonstração
export const clientesMock: Cliente[] = [
  (() => {
    const cliente1 = new Cliente(
      'João Silva',
      '123.456.789-00',
      '(11) 99999-9999',
      'joao@email.com',
      'Rua das Flores, 123 - São Paulo/SP'
    )
    cliente1.adicionarVeiculo(new Veiculo(
      'ABC-1234',
      'Honda',
      'Civic',
      2020,
      'Prata',
      'Flex',
      45000,
      cliente1.id
    ))
    return cliente1
  })(),
  
  (() => {
    const cliente2 = new Cliente(
      'Maria Santos',
      '987.654.321-00',
      '(11) 88888-8888',
      'maria@email.com',
      'Av. Paulista, 456 - São Paulo/SP'
    )
    cliente2.adicionarVeiculo(new Veiculo(
      'XYZ-5678',
      'Toyota',
      'Corolla',
      2019,
      'Branco',
      'Flex',
      38000,
      cliente2.id
    ))
    return cliente2
  })(),
  
  (() => {
    const cliente3 = new Cliente(
      'Pedro Costa',
      '456.789.123-00',
      '(11) 77777-7777',
      'pedro@email.com',
      'Rua Augusta, 789 - São Paulo/SP'
    )
    cliente3.adicionarVeiculo(new Veiculo(
      'DEF-9012',
      'Ford',
      'Ka',
      2021,
      'Azul',
      'Flex',
      25000,
      cliente3.id
    ))
    return cliente3
  })()
]

export const historicoServicosMock: HistoricoServico[] = [
  (() => {
    const historico1 = new HistoricoServico(
      clientesMock[0].id,
      'ABC-1234',
      'Troca de óleo e filtros',
      80.00,
      'Carlos Mecânico',
      'Serviço de manutenção preventiva'
    )
    historico1.adicionarPeca({
      nome: 'Óleo Motor 5W30',
      quantidade: 4,
      preco: 45.90,
      fornecedor: 'Distribuidora ABC'
    })
    historico1.adicionarPeca({
      nome: 'Filtro de Óleo',
      quantidade: 1,
      preco: 25.50,
      fornecedor: 'Peças XYZ'
    })
    historico1.concluirServico()
    return historico1
  })(),
  
  (() => {
    const historico2 = new HistoricoServico(
      clientesMock[1].id,
      'XYZ-5678',
      'Revisão completa dos 40.000km',
      150.00,
      'Roberto Mecânico',
      'Revisão conforme manual do fabricante'
    )
    historico2.adicionarPeca({
      nome: 'Filtro de Ar',
      quantidade: 1,
      preco: 35.00,
      fornecedor: 'Auto Peças 123'
    })
    historico2.adicionarPeca({
      nome: 'Velas de Ignição',
      quantidade: 4,
      preco: 28.90,
      fornecedor: 'Peças XYZ'
    })
    return historico2
  })(),
  
  (() => {
    const historico3 = new HistoricoServico(
      clientesMock[2].id,
      'DEF-9012',
      'Reparo no sistema de freios',
      120.00,
      'José Mecânico',
      'Substituição de pastilhas e discos'
    )
    historico3.adicionarPeca({
      nome: 'Pastilha de Freio',
      quantidade: 1,
      preco: 89.90,
      fornecedor: 'Auto Peças 123'
    })
    historico3.adicionarPeca({
      nome: 'Disco de Freio',
      quantidade: 2,
      preco: 145.00,
      fornecedor: 'Freios Brasil'
    })
    historico3.concluirServico()
    return historico3
  })(),
  
  // Histórico adicional para o mesmo cliente (João Silva)
  (() => {
    const historico4 = new HistoricoServico(
      clientesMock[0].id,
      'ABC-1234',
      'Alinhamento e balanceamento',
      60.00,
      'Carlos Mecânico',
      'Serviço realizado após troca de pneus'
    )
    historico4.concluirServico()
    return historico4
  })()
]