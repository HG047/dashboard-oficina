"use client"

import { useState, useMemo } from 'react'
import { 
  Users, Calendar, Search, Filter, ChevronLeft, ChevronRight, 
  Plus, Edit, CheckCircle, Clock, AlertTriangle, Settings, 
  Home, FileText, Circle, X, User, Car, History, Eye, Package,
  TrendingUp, DollarSign, ShoppingCart, Wrench, UserCheck, Camera,
  Trash2
} from 'lucide-react'

// Importar as classes e tipos
import { 
  Cliente, 
  Veiculo, 
  HistoricoServico, 
  PecaUtilizada,
  clientesMock,
  historicoServicosMock,
  Vehicle,
  StockItem
} from '@/lib/types'

// Importar componentes de autenticação
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserMenu } from '@/components/UserMenu'
import { useAuth } from '@/contexts/AuthContext'

// Importar componente PWA
import { PWAInstallBanner } from '@/components/PWAInstallBanner'

// Tipos de dados existentes
interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  price: number
  supplier: string
  // NOVOS CAMPOS FINANCEIROS
  costPrice: number // Valor pago pela peça
  salePrice: number // Valor de venda
  profitMargin: number // % de ganho
  profitValue: number // Valor do ganho
}

// NOVO TIPO: Mecânico
interface Mecanico {
  id: string
  nome: string
  especialidade: string
  telefone: string
  email: string
  comissaoPercentual: number // % de comissão sobre serviços
  dataCadastro: Date
  ativo: boolean
}

// NOVO TIPO: Serviço do Mecânico
interface ServicoMecanico {
  id: string
  mecanicoId: string
  clienteId: string
  placaVeiculo: string
  descricaoServico: string
  valorTotal: number
  comissaoPercentual: number
  valorComissao: number
  dataServico: Date
  status: 'em_andamento' | 'concluido' | 'cancelado'
  observacoes?: string
}

// NOVO TIPO: Serviço de Check-in
interface ServicoCheckin {
  id: string
  codigo: string // Código único gerado automaticamente
  clienteId: string
  placaVeiculo: string
  marca: string
  modelo: string
  ano: number
  cor: string
  quilometragem: number
  combustivel: string
  descricaoProblema: string
  observacoes?: string
  fotos: string[] // URLs das fotos
  dataEntrada: Date
  status: 'aguardando' | 'em_andamento' | 'concluido' | 'entregue'
  mecanicoResponsavel?: string
  valorOrcamento?: number
  dataPrevisaoEntrega?: Date
}

// Dados mock existentes
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    model: 'Honda Civic 2020',
    owner: 'João Silva',
    phone: '(11) 99999-9999',
    service: 'Troca de óleo e filtros',
    status: 'in-progress',
    entryDate: '2024-01-15',
    estimatedCompletion: '2024-01-16',
    totalCost: 250.00
  },
  {
    id: '2',
    plate: 'XYZ-5678',
    model: 'Toyota Corolla 2019',
    owner: 'Maria Santos',
    phone: '(11) 88888-8888',
    service: 'Revisão completa',
    status: 'waiting',
    entryDate: '2024-01-15',
    estimatedCompletion: '2024-01-17',
    totalCost: 450.00
  },
  {
    id: '3',
    plate: 'DEF-9012',
    model: 'Ford Ka 2021',
    owner: 'Pedro Costa',
    phone: '(11) 77777-7777',
    service: 'Reparo no freio',
    status: 'completed',
    entryDate: '2024-01-14',
    estimatedCompletion: '2024-01-15',
    totalCost: 320.00
  },
  {
    id: '4',
    plate: 'GHI-3456',
    model: 'Volkswagen Gol 2018',
    owner: 'Ana Oliveira',
    phone: '(11) 66666-6666',
    service: 'Troca de pneus',
    status: 'delivered',
    entryDate: '2024-01-13',
    estimatedCompletion: '2024-01-14',
    totalCost: 800.00
  }
]

const mockStock: StockItem[] = [
  {
    id: '1',
    name: 'Óleo Motor 5W30',
    category: 'Lubrificantes',
    quantity: 25,
    minStock: 10,
    price: 45.90,
    supplier: 'Distribuidora ABC',
    costPrice: 35.00,
    salePrice: 45.90,
    profitMargin: 31.14,
    profitValue: 10.90
  },
  {
    id: '2',
    name: 'Filtro de Óleo',
    category: 'Filtros',
    quantity: 8,
    minStock: 15,
    price: 25.50,
    supplier: 'Peças XYZ',
    costPrice: 18.00,
    salePrice: 25.50,
    profitMargin: 41.67,
    profitValue: 7.50
  },
  {
    id: '3',
    name: 'Pastilha de Freio',
    category: 'Freios',
    quantity: 12,
    minStock: 8,
    price: 89.90,
    supplier: 'Auto Peças 123',
    costPrice: 65.00,
    salePrice: 89.90,
    profitMargin: 38.31,
    profitValue: 24.90
  },
  {
    id: '4',
    name: 'Pneu 185/65R15',
    category: 'Pneus',
    quantity: 6,
    minStock: 4,
    price: 280.00,
    supplier: 'Pneus Brasil',
    costPrice: 220.00,
    salePrice: 280.00,
    profitMargin: 27.27,
    profitValue: 60.00
  }
]

// NOVOS DADOS MOCK: Mecânicos
const mockMecanicos: Mecanico[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    especialidade: 'Motor e Transmissão',
    telefone: '(11) 99999-1111',
    email: 'carlos@automech.com',
    comissaoPercentual: 15,
    dataCadastro: new Date('2024-01-01'),
    ativo: true
  },
  {
    id: '2',
    nome: 'Roberto Santos',
    especialidade: 'Freios e Suspensão',
    telefone: '(11) 99999-2222',
    email: 'roberto@automech.com',
    comissaoPercentual: 12,
    dataCadastro: new Date('2024-01-05'),
    ativo: true
  },
  {
    id: '3',
    nome: 'Ana Costa',
    especialidade: 'Elétrica e Eletrônica',
    telefone: '(11) 99999-3333',
    email: 'ana@automech.com',
    comissaoPercentual: 18,
    dataCadastro: new Date('2024-01-10'),
    ativo: true
  }
]

// NOVOS DADOS MOCK: Serviços dos Mecânicos
const mockServicosMecanicos: ServicoMecanico[] = [
  {
    id: '1',
    mecanicoId: '1',
    clienteId: '1',
    placaVeiculo: 'ABC-1234',
    descricaoServico: 'Troca de óleo e filtros',
    valorTotal: 250.00,
    comissaoPercentual: 50, // 50% conforme solicitado
    valorComissao: 125.00,
    dataServico: new Date('2024-01-15'),
    status: 'concluido',
    observacoes: 'Serviço realizado conforme especificação'
  },
  {
    id: '2',
    mecanicoId: '2',
    clienteId: '2',
    placaVeiculo: 'XYZ-5678',
    descricaoServico: 'Reparo no sistema de freios',
    valorTotal: 450.00,
    comissaoPercentual: 50,
    valorComissao: 225.00,
    dataServico: new Date('2024-01-16'),
    status: 'em_andamento'
  },
  {
    id: '3',
    mecanicoId: '3',
    clienteId: '3',
    placaVeiculo: 'DEF-9012',
    descricaoServico: 'Diagnóstico e reparo elétrico',
    valorTotal: 320.00,
    comissaoPercentual: 50,
    valorComissao: 160.00,
    dataServico: new Date('2024-01-17'),
    status: 'concluido'
  }
]

// NOVOS DADOS MOCK: Serviços de Check-in
const mockServicosCheckin: ServicoCheckin[] = [
  {
    id: '1',
    codigo: 'SRV-001',
    clienteId: '1',
    placaVeiculo: 'ABC-1234',
    marca: 'Honda',
    modelo: 'Civic',
    ano: 2020,
    cor: 'Prata',
    quilometragem: 45000,
    combustivel: 'Flex',
    descricaoProblema: 'Ruído estranho no motor e perda de potência',
    observacoes: 'Cliente relatou que o problema começou há uma semana',
    fotos: [],
    dataEntrada: new Date('2024-01-15'),
    status: 'em_andamento',
    mecanicoResponsavel: 'Carlos Silva',
    valorOrcamento: 850.00,
    dataPrevisaoEntrega: new Date('2024-01-18')
  },
  {
    id: '2',
    codigo: 'SRV-002',
    clienteId: '2',
    placaVeiculo: 'XYZ-5678',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2019,
    cor: 'Branco',
    quilometragem: 62000,
    combustivel: 'Flex',
    descricaoProblema: 'Freios fazendo barulho e pedal mole',
    observacoes: 'Revisão de 60.000km em atraso',
    fotos: [],
    dataEntrada: new Date('2024-01-16'),
    status: 'aguardando',
    valorOrcamento: 650.00,
    dataPrevisaoEntrega: new Date('2024-01-19')
  }
]

// Função para gerar código único
const gerarCodigoServico = () => {
  const timestamp = Date.now().toString().slice(-6)
  return `SRV-${timestamp}`
}

// Componente Sidebar ATUALIZADO - Adicionando "Serviços" e Menu de Usuário
function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Wrench }, // NOVO MENU
    { id: 'mecanicos', label: 'Mecânicos', icon: UserCheck },
    { id: 'stock', label: 'Estoque', icon: Package },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ]

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Circle className="w-6 h-6 text-blue-400" />
          AutoMech Pro
        </h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Menu de Usuário na Sidebar */}
      <div className="p-4 border-t border-slate-700">
        <UserMenu />
      </div>
    </div>
  )
}

// Componente Card de Estatística
function StatCard({ title, value, icon: Icon, trend, color = "blue" }: {
  title: string
  value: string | number
  icon: any
  trend?: string
  color?: string
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Componente Dashboard ATUALIZADO com métricas financeiras
function Dashboard({ vehicles, stock, clientes, historicos }: { 
  vehicles: Vehicle[], 
  stock: StockItem[], 
  clientes: Cliente[], 
  historicos: HistoricoServico[] 
}) {
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length
    const inProgress = vehicles.filter(v => v.status === 'in-progress').length
    const completed = vehicles.filter(v => v.status === 'completed').length
    const lowStock = stock.filter(item => item.quantity <= item.minStock).length
    const totalClientes = clientes.length
    const servicosHoje = historicos.filter(h => {
      const hoje = new Date().toDateString()
      return h.dataServico.toDateString() === hoje
    }).length
    
    // NOVAS MÉTRICAS FINANCEIRAS
    const totalReceita = historicos
      .filter(h => h.status === 'concluido')
      .reduce((acc, h) => acc + h.valorTotal, 0)
    
    const valorVendaPecas = stock.reduce((acc, item) => 
      acc + (item.salePrice * item.quantity), 0)
    
    const valorGastos = stock.reduce((acc, item) => 
      acc + (item.costPrice * item.quantity), 0)
    
    const lucroEstoque = stock.reduce((acc, item) => 
      acc + (item.profitValue * item.quantity), 0)
    
    return { 
      totalVehicles, 
      inProgress, 
      completed, 
      lowStock, 
      totalClientes, 
      servicosHoje,
      totalReceita,
      valorVendaPecas,
      valorGastos,
      lucroEstoque
    }
  }, [vehicles, stock, clientes, historicos])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral da oficina</p>
      </div>

      {/* Cards de Estatísticas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Total"
          value={`R$ ${stats.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Valor de Venda (Peças)"
          value={`R$ ${stats.valorVendaPecas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Gastos (Peças)"
          value={`R$ ${stats.valorGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Lucro Estimado"
          value={`R$ ${stats.lucroEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Wrench}
          color="purple"
        />
      </div>

      {/* Cards de Estatísticas Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClientes}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Veículos em Serviço"
          value={stats.inProgress}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Serviços Hoje"
          value={stats.servicosHoje}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Estoque Baixo"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="purple"
        />
      </div>

      {/* Placeholder para Gráfico */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços por Mês</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Circle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Gráfico será implementado aqui</p>
            <p className="text-sm text-gray-400">Integração com biblioteca de gráficos</p>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-3">
          {vehicles.slice(0, 3).map((vehicle) => (
            <div key={`activity-${vehicle.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                vehicle.status === 'completed' ? 'bg-green-500' :
                vehicle.status === 'in-progress' ? 'bg-orange-500' :
                vehicle.status === 'waiting' ? 'bg-blue-500' : 'bg-gray-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{vehicle.plate} - {vehicle.model}</p>
                <p className="text-sm text-gray-600">{vehicle.service}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                vehicle.status === 'completed' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                vehicle.status === 'waiting' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {vehicle.status === 'completed' ? 'Concluído' :
                 vehicle.status === 'in-progress' ? 'Em Andamento' :
                 vehicle.status === 'waiting' ? 'Aguardando' : 'Entregue'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// NOVO COMPONENTE: Modal de Serviço Check-in
function ServicoCheckinModal({ servico, clientes, isOpen, onClose, onSave, onDelete }: {
  servico?: ServicoCheckin
  clientes: Cliente[]
  isOpen: boolean
  onClose: () => void
  onSave: (servico: ServicoCheckin) => void
  onDelete?: (servicoId: string) => void
}) {
  const [formData, setFormData] = useState({
    clienteId: servico?.clienteId || '',
    placaVeiculo: servico?.placaVeiculo || '',
    marca: servico?.marca || '',
    modelo: servico?.modelo || '',
    ano: servico?.ano || new Date().getFullYear(),
    cor: servico?.cor || '',
    quilometragem: servico?.quilometragem || 0,
    combustivel: servico?.combustivel || '',
    descricaoProblema: servico?.descricaoProblema || '',
    observacoes: servico?.observacoes || '',
    valorOrcamento: servico?.valorOrcamento || 0,
    dataPrevisaoEntrega: servico?.dataPrevisaoEntrega?.toISOString().split('T')[0] || '',
    mecanicoResponsavel: servico?.mecanicoResponsavel || '',
    status: servico?.status || 'aguardando' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novoServico: ServicoCheckin = {
      id: servico?.id || Date.now().toString(),
      codigo: servico?.codigo || gerarCodigoServico(),
      ...formData,
      fotos: servico?.fotos || [],
      dataEntrada: servico?.dataEntrada || new Date(),
      dataPrevisaoEntrega: formData.dataPrevisaoEntrega ? new Date(formData.dataPrevisaoEntrega) : undefined
    }
    
    onSave(novoServico)
    onClose()
  }

  const handleDelete = () => {
    if (servico && onDelete && confirm('Tem certeza que deseja excluir este serviço?')) {
      onDelete(servico.id)
      onClose()
    }
  }

  const clienteSelecionado = clientes.find(c => c.id === formData.clienteId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {servico ? `Editar Serviço ${servico.codigo}` : 'Novo Check-in de Serviço'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Cliente */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente, index) => (
                    <option key={`cliente-modal-${cliente.id}-${index}`} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa do Veículo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.placaVeiculo}
                    onChange={(e) => setFormData({...formData, placaVeiculo: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC-1234"
                    required
                  />
                  {clienteSelecionado && clienteSelecionado.veiculos.length > 0 && (
                    <select
                      onChange={(e) => {
                        const veiculo = clienteSelecionado.veiculos.find(v => v.placa === e.target.value)
                        if (veiculo) {
                          setFormData({
                            ...formData,
                            placaVeiculo: veiculo.placa,
                            marca: veiculo.marca,
                            modelo: veiculo.modelo,
                            ano: veiculo.ano,
                            combustivel: veiculo.combustivel,
                            quilometragem: veiculo.quilometragem
                          })
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecionar veículo</option>
                      {clienteSelecionado.veiculos.map(veiculo => (
                        <option key={veiculo.placa} value={veiculo.placa}>
                          {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Veículo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados do Veículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <input
                  type="number"
                  value={formData.ano}
                  onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input
                  type="text"
                  value={formData.cor}
                  onChange={(e) => setFormData({...formData, cor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem</label>
                <input
                  type="number"
                  value={formData.quilometragem}
                  onChange={(e) => setFormData({...formData, quilometragem: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                <select
                  value={formData.combustivel}
                  onChange={(e) => setFormData({...formData, combustivel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Flex">Flex</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Etanol">Etanol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Descrição do Problema */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Descrição do Serviço</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problema Relatado</label>
                <textarea
                  value={formData.descricaoProblema}
                  onChange={(e) => setFormData({...formData, descricaoProblema: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações Adicionais</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Informações do Serviço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mecânico Responsável</label>
                <input
                  type="text"
                  value={formData.mecanicoResponsavel}
                  onChange={(e) => setFormData({...formData, mecanicoResponsavel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="aguardando">Aguardando</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="entregue">Entregue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Orçamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorOrcamento}
                  onChange={(e) => setFormData({...formData, valorOrcamento: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previsão de Entrega</label>
                <input
                  type="date"
                  value={formData.dataPrevisaoEntrega}
                  onChange={(e) => setFormData({...formData, dataPrevisaoEntrega: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Área de Fotos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fotos do Veículo</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Adicione fotos do veículo</p>
              <p className="text-sm text-gray-500">Funcionalidade de upload será implementada</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            {servico && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// NOVO COMPONENTE: Gerenciamento de Serviços
function ServicoManagement({ 
  servicosCheckin, 
  setServicosCheckin, 
  clientes 
}: { 
  servicosCheckin: ServicoCheckin[]
  setServicosCheckin: (servicos: ServicoCheckin[]) => void
  clientes: Cliente[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedServico, setSelectedServico] = useState<ServicoCheckin | undefined>()
  
  const itemsPerPage = 5

  const filteredServicos = useMemo(() => {
    return servicosCheckin.filter(servico => {
      const cliente = clientes.find(c => c.id === servico.clienteId)
      const matchesSearch = 
        servico.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.placaVeiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.descricaoProblema.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || servico.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [servicosCheckin, clientes, searchTerm, statusFilter])

  const paginatedServicos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredServicos.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredServicos, currentPage])

  const totalPages = Math.ceil(filteredServicos.length / itemsPerPage)

  const handleSaveServico = (servico: ServicoCheckin) => {
    const existingIndex = servicosCheckin.findIndex(s => s.id === servico.id)
    if (existingIndex >= 0) {
      const updatedServicos = [...servicosCheckin]
      updatedServicos[existingIndex] = servico
      setServicosCheckin(updatedServicos)
    } else {
      setServicosCheckin([...servicosCheckin, servico])
    }
  }

  const handleDeleteServico = (servicoId: string) => {
    const updatedServicos = servicosCheckin.filter(s => s.id !== servicoId)
    setServicosCheckin(updatedServicos)
  }

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-yellow-100 text-yellow-800'
      case 'em_andamento': return 'bg-blue-100 text-blue-800'
      case 'concluido': return 'bg-green-100 text-green-800'
      case 'entregue': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando': return 'Aguardando'
      case 'em_andamento': return 'Em Andamento'
      case 'concluido': return 'Concluído'
      case 'entregue': return 'Entregue'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Check-in e acompanhamento de serviços</p>
        </div>
        <button
          onClick={() => {
            setSelectedServico(undefined)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Check-in
        </button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Serviços"
          value={servicosCheckin.length}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="Aguardando"
          value={servicosCheckin.filter(s => s.status === 'aguardando').length}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Em Andamento"
          value={servicosCheckin.filter(s => s.status === 'em_andamento').length}
          icon={Settings}
          color="blue"
        />
        <StatCard
          title="Concluídos"
          value={servicosCheckin.filter(s => s.status === 'concluido').length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por código, placa, cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="aguardando">Aguardando</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="entregue">Entregue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente/Veículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problema</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Entrada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mecânico</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedServicos.map((servico) => (
                <tr key={`servico-${servico.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{servico.codigo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{getClienteNome(servico.clienteId)}</div>
                      <div className="text-sm text-gray-500">{servico.placaVeiculo} - {servico.marca} {servico.modelo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{servico.descricaoProblema}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {servico.dataEntrada.toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {servico.mecanicoResponsavel || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {servico.valorOrcamento ? `R$ ${servico.valorOrcamento.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(servico.status)}`}>
                      {getStatusLabel(servico.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedServico(servico)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredServicos.length)} de {filteredServicos.length} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ServicoCheckinModal
        servico={selectedServico}
        clientes={clientes}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveServico}
        onDelete={handleDeleteServico}
      />
    </div>
  )
}

// Componente Principal ATUALIZADO com Proteção de Rotas e PWA
export default function AutoMechDashboard() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [stock, setStock] = useState<StockItem[]>(mockStock)
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock)
  const [historicos, setHistoricos] = useState<HistoricoServico[]>(historicoServicosMock)
  
  // NOVOS ESTADOS para Mecânicos e Serviços
  const [mecanicos, setMecanicos] = useState<Mecanico[]>(mockMecanicos)
  const [servicosMecanicos, setServicosMecanicos] = useState<ServicoMecanico[]>(mockServicosMecanicos)
  const [servicosCheckin, setServicosCheckin] = useState<ServicoCheckin[]>(mockServicosCheckin)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard vehicles={vehicles} stock={stock} clientes={clientes} historicos={historicos} />
      case 'servicos': // NOVO CASO
        return (
          <ServicoManagement 
            servicosCheckin={servicosCheckin}
            setServicosCheckin={setServicosCheckin}
            clientes={clientes}
          />
        )
      default:
        return <Dashboard vehicles={vehicles} stock={stock} clientes={clientes} historicos={historicos} />
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* PWA Install Banner */}
        <PWAInstallBanner />
        
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Navigation ATUALIZADO */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex justify-around py-2">
            {[
              { id: 'dashboard', icon: Home, label: 'Dashboard' },
              { id: 'clients', icon: Users, label: 'Clientes' },
              { id: 'servicos', icon: Wrench, label: 'Serviços' }, // NOVO ITEM
              { id: 'mecanicos', icon: UserCheck, label: 'Mecânicos' },
              { id: 'stock', icon: Package, label: 'Estoque' }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={`mobile-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'text-blue-600' 
                      : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header com Menu de Usuário */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Circle className="w-5 h-5 text-blue-600" />
              AutoMech Pro
            </h1>
            <UserMenu />
          </div>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}