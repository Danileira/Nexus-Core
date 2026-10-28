from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

#Inicializando o flask
app = Flask(__name__)
CORS(app)

#Configurando o banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nexus.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #recurso que permite monitorar as mudanças feitas no banco de dados a cada pequena alteração

#Iniciando o gerenciador do banco de dados
db = SQLAlchemy(app)

#Representando tabela 'Veículo' (Entidade 1) no Banco de Dados
class Veiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    capacidade_toneladas = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='DISPONIVEL')

    #Relacionament com viagens (permite acessar todas as viagens deste veiculo)
    viagens = db.relationship('Viagem', backref='veiculo', lazy=True)

    #Definindo o repr (representação do objeto como uma string)
    def __repr__(self):
        return f'Veiculo {self.placa} - {self.modelo}'

    #Método de conversão para o dicionário JSON
    def to_dict(self):
        return {
            'id': self.id,
            'placa': self.placa,
            'modelo': self.modelo,
            'capacidade_toneladas': self.capacidade_toneladas,
            'status':self.status
        }

#Entidade 2: Motorista
class Motorista(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cnh = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(20), default='DISPONIVEL')

    #Relacionamento: Permite acessar todas as viagens deste motorista
    viagens = db.relationship('Viagem', backref='motorista', lazy=True)

    #Definindo o repr
    def __repr__(self):
        return f'<Motorista {self.cnh} - {self.nome}>'

    #Método de conversão para o dicionário JSON
    def to_dict(self):
        return {
            'id':self.id,
            'nome': self.nome,
            'cnh':self.cnh,
            'status':self.status
        }

#Entidade 3: Viagem (Tabela de Associação/Operação)
class Viagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    origem = db.Column(db.String(100), nullable=False)
    destino = db.Column(db.String(100), nullable=False)
    data_saida = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='EM_COMANDAMENTO')

    #Chaves Estrangeiras (Vínculo com as tabelas Veiículo e Motorista pelo ID)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculo.id'), nullable=False)
    motorista_id = db.Column(db.Integer, db.ForeignKey('motorista.id'), nullable=False)

    #Definindo o repr
    def __repr__(self):
        return f'<Viagem {self.origem} -> {self.destino}>'

    #Método de conversão para o dicionário JSON
    def to_dict(self):
        return {
            'id': self.id,
            'origem': self.origem,
            'destino': self.destino,
            'data_saida': self.data_saida.strftime('%Y-%m-%d %H:%M:%S'), #Conversão para string no formato 'AAAA-MM-DD HH:MM:SS'
            'status': self.status,
            'veiculo_id': self.veiculo_id,
            'motorista_id': self.motorista_id
        }

#Rotas e inicialização

#Rota de inicio
@app.route('/')
def inicio():
    return jsonify({'mensagem':'API Nexus Core em execucao!'})

#Rotas de veiculos (GET)
@app.route('/veiculos', methods=['GET'])
def listar_veiculos():
    veiculos = Veiculo.query.all()
    lista_veiculos = [v.to_dict() for v in veiculos]
    return jsonify(lista_veiculos), 200

#Rotas de veiculos (POST)
@app.route('/veiculos', methods=['POST'])
def cadastrar_veiculo():
    dados = request.get_json()

    #Verificando se os dados de entrada foram informados
    if not dados or 'placa' not in dados or 'modelo' not in dados or 'capacidade_toneladas' not in dados:
        return jsonify({'ERRO': 'Dados Incompletos! Informe PLACA, MODELO e CAPACIDADE_TONELADAS.'}), 400

    #Verificando se a placa do veiculo ja foi cadastrada
    veiculo_existente = Veiculo.query.filter_by(placa=dados['placa']).first()
    if veiculo_existente:
        return jsonify({'ERRO': 'Ja existe um veiculo cadastrado com esta placa!'}), 400

    #Criando o novo veiculo
    novo_veiculo = Veiculo(
        placa = dados ['placa'], 
        modelo = dados ['modelo'],
        capacidade_toneladas = dados ['capacidade_toneladas']
    )

    #Salvando o novo veiculo no banco de dados
    db.session.add(novo_veiculo)
    db.session.commit()

    return jsonify({'MENSAGEM': 'Veiculo cadastrado com sucesso!', 'veiculo': novo_veiculo.to_dict()}), 201

#Rotas de Veiculos (PUT)
@app.route('/veiculos/<int:id>', methods = ['PUT'])
def atualizar_veiculo(id):
    veiculo = Veiculo.query.get(id)
    if not veiculo:
        return jsonify({'ERRO': 'Veiculo informado nao existe no registro de veiculos!'}), 404

    dados = request.get_json()

    #Se a placa for enviada, verifica se ela ja foi cadastrada em outro veiculo
    if 'placa' in dados and dados['placa'] != veiculo.placa:
        placa_existente = Veiculo.query.filter_by(placa=dados['placa']).first()
        if placa_existente:
            return jsonify({'ERRO': 'Esta placa ja está cadastrada em outro veiculo!'}), 400
        veiculo.placa = dados['placa']

    #Atualiza apenas os campos enviados no JSON
    if 'modelo' in dados:
        veiculo.modelo = dados['modelo']

    if 'capacidade_toneladas' in dados:
        veiculo.capacidade_toneladas = dados['capacidade_toneladas']

    if 'status' in dados:
        veiculo.status = dados['status']

    db.session.commit()
    return jsonify({'MENSAGEM': 'Veiculo atualizado com sucesso!', 'veiculo': veiculo.to_dict()}), 200

#Rotas de Veículos (DELETE)
@app.route('/veiculos/<int:id>', methods=['DELETE'])
def deletar_veiculos(id):
    veiculo = Veiculo.query.get(id)
    if not veiculo:
        return jsonify({'ERRO': 'Veiculo informado não existe no registro de veiculos'}), 404

    #Regra de Negócio: Não deve ser possivel remover um veiculo se ele estiver em viagem
    viagens_ativas = [v for v in veiculo.viagens if v.status not in ['CONCLUIDA', 'CANCELADA']]
    if viagens_ativas:
        return jsonify({'ERRO': 'Nao foi possivel remover! Este veiculo possui viagens em andamento.'}), 400

    db.session.delete(veiculo)
    db.session.commit()
    return jsonify({'MENSAGEM': f'Veiculo ID {id} removido com sucesso!'}), 200


#Rotas de Motoristas (GET)
@app.route('/motoristas', methods=['GET'])
def listar_motoristas():
    motoristas = Motorista.query.all()
    lista_motoristas = [m.to_dict() for m in motoristas]
    return jsonify(lista_motoristas), 200

#Rotas de Motoristas (POST)
@app.route('/motoristas', methods=['POST'])
def cadastrar_motoristas():
    dados = request.get_json()

    #Validação de Campos Obrigatórios
    if not dados or 'nome' not in dados or 'cnh' not in dados:
        return jsonify({'ERRO': 'Dados Incompletos! Informe NOME e CNH.'}), 400

    #Validação de CNH duplicada
    motorista_existente = Motorista.query.filter_by(cnh=dados['cnh']).first()
    if motorista_existente:
        return jsonify({'ERRO': 'Ja existe um motorista cadastrado com essa CNH!'}), 400

    #Criando o novo motorista (objeto)
    novo_motorista = Motorista(
        nome=dados['nome'],
        cnh=dados['cnh']
    )

    db.session.add(novo_motorista)
    db.session.commit()

    return jsonify({'MENSAGEM': 'Motorista cadastrado com sucesso!', 'Motorista': novo_motorista.to_dict()}), 201

#Rotas de Motoristas (PUT) - Atualizar dados de Motorista existente
@app.route('/motoristas/<int:id>', methods=['PUT'])
def atualizar_motorista(id):
    motorista = Motorista.query.get(id)
    if not motorista:
        return jsonify({'ERRO': 'Motorista informado nao existe no registro de motoristas!'}), 404

    dados = request.get_json()

    #Se a CNH for enviada, valida se não for pertencente a outro motorista
    if 'cnh' in dados and dados['cnh'] != motorista.cnh:
        cnh_existente = Motorista.query.filter_by(cnh=dados['cnh']).first()
        if cnh_existente:
            return jsonify({'ERRO': 'Esta CNH ja esta cadastrada para outro motorista!'}), 400  
        motorista.cnh = dados['cnh']

    #Atualiza apenas os campos enviados no JSON
    if 'nome' in dados:
        motorista.nome = dados['nome']

    if 'status' in dados:
        motorista.status = dados['status']

    db.session.commit()
    return jsonify({'MENSAGEM': 'Motorista atualizado com sucesso!', 'motorista': motorista.to_dict()}), 200

#Rotas de Motoristas (DELETE)
@app.route('/motoristas/<int:id>', methods=['DELETE'])
def deletar_motoristas(id):
    motorista = Motorista.query.get(id)
    if not motorista:
        return jsonify({'ERRO': 'Motorista informado nao existe no registro de motoristas!'}), 404

    #Regra de Negócio: Não deve ser possível remover um motorista se ele estiver em viagem
    viagens_ativas = [v for v in motorista.viagens if v.status not in ['CONCLUIDA', 'CANCELADA']]
    if viagens_ativas:
        return jsonify({'ERRO': 'Nao foi possivel remover! Este motorista possui viagens em andamento.'}), 400

    db.session.delete(motorista)
    db.session.commit()
    return jsonify({'MENSAGEM': f'Motorista ID {id} removido com sucesso!'}), 200

#Rotas de Viagens (GET)
@app.route('/viagens', methods=['GET'])
def listar_viagens():
    viagens = Viagem.query.all()
    lista_viagens = [v.to_dict() for v in viagens]
    return jsonify(lista_viagens), 200

#Rotas de Viagens (POST)
@app.route('/viagens', methods=['POST'])
def cadastrar_viagem():
    dados = request.get_json()

    #Validação de campos obrigatórios
    if not dados or 'origem' not in dados or 'destino' not in dados or 'veiculo_id' not in dados or 'motorista_id' not in dados:
        return jsonify({'ERRO': 'Dados incompletos! Informe ORIGEM, DESTINO, VEICULO_ID e MOTORISTA_ID.'}), 400

    #Validação de existência do Veículo
    veiculo = Veiculo.query.get(dados['veiculo_id'])
    if not veiculo:
        return jsonify({'ERRO': 'Veiculo informado não existe no registro de veiculos!'}), 404

    #Regra de Negócio: Veículo precisa estar disponível
    if veiculo.status.upper() != 'DISPONIVEL':
        return jsonify({'ERRO': f'Veiculo ID {veiculo.id} nao esta disponivel! Status atual: {veiculo.status}'}), 400

    #Validação de existência de Motorista
    motorista = Motorista.query.get(dados['motorista_id'])
    if not motorista:
        return jsonify({'ERRO': 'Motorista informado não existe no registro de motoristas!'}), 404

    #Regra de negício: Motorista precisa estar disponível
    if motorista.status.upper() != 'DISPONIVEL':
        return jsonify({'ERRO': f'Motorista ID {motorista.id} nao esta disponivel! Status atual: {motorista.status}'}), 400

    #Criando o novo objeto Viagem
    nova_viagem = Viagem(
        origem=dados['origem'],
        destino=dados['destino'],
        veiculo_id=dados['veiculo_id'],
        motorista_id=dados['motorista_id']
    )

    #Regra de Negócio: atualiza automaticamente o status do Veículo e do Motorista
    veiculo.status = 'EM_VIAGEM'
    motorista.status = 'EM_VIAGEM'

    #Salvando o novo objeto Viagem no banco de dados
    db.session.add(nova_viagem)
    db.session.commit()

    return jsonify({'MENSAGEM': 'Viagem cadastrada com sucesso!', 'Viagem': nova_viagem.to_dict()}), 201

#Rotas de Viagens (PUT)
@app.route('/viagens/<int:id>', methods=['PUT'])
def atualizar_viagem(id):
    viagem = Viagem.query.get(id)
    if not viagem:
        return jsonify({'ERRO': 'Viagem informada não existe no registro de viagens!'}), 404

    dados = request.get_json()

    #Validações caso o usuário queira trocar o veículo ou o motorista de viagem
    if 'veiculo_id' in dados:
        veiculo = Veiculo.query.get(dados['veiculo_id'])
        if not veiculo:
            return jsonify({'ERRO': 'Veiculo informado nao existe no registro de veiculos!'}), 404
        viagem.veiculo_id = dados['veiculo_id']

    if 'motorista_id' in dados:
        motorista = Motorista.query.get(dados['motorista_id'])
        if not motorista:
            return jsonify({'ERRO': 'Motorista informado nao existe no cadastro de veiculos!'}), 404
        viagem.motorista_id = dados['motorista_id']

    #Atualiza apenas os campos enviados no JSON
    if 'origem' in dados:
        viagem.origem = dados['origem']
    if 'destino' in dados:
        viagem.destino = dados['destino']
    
    #Se o status da viagem for atualizado
    if 'status' in dados:
        novo_status = dados['status']
        viagem.status = dados['status']

        #Regra de Negócio: se a viagem for CONCLUÍDA ou CANCELADA, libera o veículo e o motorista
        if novo_status in ['CONCLUIDA', 'CANCELADA']:
            veiculo = Veiculo.query.get(viagem.veiculo_id)
            motorista = Motorista.query.get(viagem.motorista_id)

            if veiculo:
                veiculo.status = 'DISPONIVEL'
            if motorista:
                motorista.status = 'DISPONIVEL'

    db.session.commit()
    return jsonify({'MENSAGEM': 'Viagem atualizada com sucesso!', 'Viagem': viagem.to_dict()}), 200

#Rotas de Viagens (DELETE)
@app.route('/viagens/<int:id>', methods=['DELETE'])
def deletar_viagem(id):
    viagem = Viagem.query.get(id)
    if not viagem:
        return jsonify({'ERRO': 'Viagem informada nao existe no registro de viagens!'}), 404

    db.session.delete(viagem)
    db.session.commit()
    return jsonify({'MENSAGEM': f'Viagem ID {id} removido com sucesso!'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Tabelas(Veículo, Motorista, Viagem) criadas/verificadas com sucesso no 'nexus.db'!")

    app.run(debug=True)