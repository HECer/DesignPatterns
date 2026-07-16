<script>
/* ================= ARCHITEKTUR & ENTERPRISE ================= */
PATTERNS.push(
{
  id:'mvc', name:'MVC (Model-View-Controller)', cat:'architectural', gof:false, icon:'🖼',
  short:{de:'Trennt Daten (Model), Darstellung (View) und Steuerung (Controller) in drei Rollen.',
         en:'Separates data (model), presentation (view) and control (controller) into three roles.'},
  intent:{de:'MVC teilt eine Anwendung in drei Verantwortungen: Das Model hält Daten und Geschäftslogik, die View stellt dar, der Controller nimmt Eingaben entgegen und orchestriert. So können UI und Logik unabhängig entwickelt, getestet und ausgetauscht werden. ASP.NET MVC und Django (dort „MTV" genannt) bauen direkt darauf auf.',
          en:'MVC divides an application into three responsibilities: the model holds data and business logic, the view renders, the controller receives input and orchestrates. UI and logic can thus be developed, tested and swapped independently. ASP.NET MVC and Django (called "MTV" there) build directly on it.'},
  analogy:{de:'Ein Restaurant: Die Küche (Model) bereitet das Essen, der Teller (View) präsentiert es, der Kellner (Controller) nimmt Bestellungen auf und vermittelt.',
           en:'A restaurant: the kitchen (model) prepares food, the plate (view) presents it, the waiter (controller) takes orders and mediates.'},
  use:{de:['Webanwendungen mit klarer Rollentrennung','Mehrere Ansichten derselben Daten','Teams: Frontend und Backend parallel entwickeln'],
       en:['Web applications with clear role separation','Multiple views of the same data','Teams: developing frontend and backend in parallel']},
  pros:{de:['Logik ohne UI testbar','Views austauschbar (HTML, JSON, PDF)','Etabliert – jedes Framework-Team kennt es'],
        en:['Logic testable without UI','Views swappable (HTML, JSON, PDF)','Established – every framework team knows it']},
  cons:{de:['Controller werden gern zu „Fat Controllers"','Grenzziehung Model/Controller oft unklar','Für Mini-Tools Overhead'],
        en:['Controllers tend to become "fat controllers"','Model/controller boundary often unclear','Overhead for tiny tools']},
  related:['mvvm','observer','mediator','repository'],
  csharp:
`// MODEL – Daten + Geschäftslogik:
public class TodoModel
{
    public List<string> Items { get; } = new();
    public void Add(string item) => Items.Add(item);
}

// VIEW – nur Darstellung:
public class TodoView
{
    public void Render(IEnumerable<string> items)
    {
        Console.WriteLine("=== Meine Aufgaben ===");
        foreach (var (item, i) in items.Select((x, i) => (x, i)))
            Console.WriteLine($"{i + 1}. {item}");
    }
}

// CONTROLLER – verbindet Eingabe, Model und View:
public class TodoController(TodoModel model, TodoView view)
{
    public void AddTodo(string text)   // "Eingabe"
    {
        if (!string.IsNullOrWhiteSpace(text))
            model.Add(text.Trim());
        view.Render(model.Items);      // View aktualisieren
    }
}

var controller = new TodoController(new TodoModel(), new TodoView());
controller.AddTodo("Design Patterns lernen");
controller.AddTodo("Projekt aufsetzen");`,
  python:
`# MODEL – Daten + Geschäftslogik:
class TodoModel:
    def __init__(self): self.items: list[str] = []
    def add(self, item: str): self.items.append(item)

# VIEW – nur Darstellung:
class TodoView:
    def render(self, items):
        print("=== Meine Aufgaben ===")
        for i, item in enumerate(items, start=1):
            print(f"{i}. {item}")

# CONTROLLER – verbindet Eingabe, Model und View:
class TodoController:
    def __init__(self, model: TodoModel, view: TodoView):
        self.model, self.view = model, view

    def add_todo(self, text: str):      # "Eingabe"
        if text.strip():
            self.model.add(text.strip())
        self.view.render(self.model.items)

controller = TodoController(TodoModel(), TodoView())
controller.add_todo("Design Patterns lernen")
controller.add_todo("Projekt aufsetzen")`
},
{
  id:'mvvm', name:'MVVM (Model-View-ViewModel)', cat:'architectural', gof:false, icon:'🪞',
  short:{de:'Die View bindet sich per Data Binding an ein ViewModel – ideal für moderne UI-Frameworks.',
         en:'The view binds to a view model via data binding – ideal for modern UI frameworks.'},
  intent:{de:'MVVM ersetzt den Controller durch ein ViewModel: Es stellt den Zustand der View als bindbare Properties und Commands bereit. Die View aktualisiert sich automatisch über Data Binding (Observer-Mechanik!), das ViewModel kennt die View nicht und ist dadurch voll testbar. Standard in WPF, MAUI, Avalonia – und konzeptionell in Vue/Knockout.',
          en:'MVVM replaces the controller with a view model: it exposes the view state as bindable properties and commands. The view updates automatically via data binding (observer mechanics!), the view model does not know the view and is therefore fully testable. Standard in WPF, MAUI, Avalonia – and conceptually in Vue/Knockout.'},
  analogy:{de:'Ein Schaufenster mit Live-Preisschildern: Ändert das Lager (Model) den Preis, aktualisiert das Preisschild-System (ViewModel) automatisch die Anzeige (View) – niemand läuft mit Edding herum.',
           en:'A shop window with live price tags: if the warehouse (model) changes a price, the tag system (view model) automatically updates the display (view) – nobody runs around with a marker.'},
  use:{de:['XAML-basierte UIs: WPF, MAUI, Avalonia, WinUI','UI-Logik ohne UI-Framework testen','Komplexe Formulare mit viel Zustand'],
       en:['XAML-based UIs: WPF, MAUI, Avalonia, WinUI','Testing UI logic without a UI framework','Complex forms with lots of state']},
  pros:{de:['ViewModel komplett unit-testbar','Automatische UI-Synchronisation','Designer & Entwickler arbeiten getrennt'],
        en:['View model fully unit-testable','Automatic UI synchronization','Designers & developers work separately']},
  cons:{de:['Binding-Fehler oft erst zur Laufzeit sichtbar','Boilerplate (INotifyPropertyChanged)','Für simple UIs überdimensioniert'],
        en:['Binding errors often only visible at runtime','Boilerplate (INotifyPropertyChanged)','Oversized for simple UIs']},
  related:['mvc','observer','command','mediator'],
  csharp:
`using System.ComponentModel;
using System.Runtime.CompilerServices;

// ViewModel: bindbarer Zustand + Benachrichtigung
public class LoginViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private string _username = "";
    public string Username
    {
        get => _username;
        set { _username = value; Notify(); Notify(nameof(CanLogin)); }
    }

    public bool CanLogin => Username.Length >= 3;

    public void Login() =>
        Console.WriteLine($"Login als {Username} ...");

    private void Notify([CallerMemberName] string? p = null) =>
        PropertyChanged?.Invoke(this, new(p));
}

// In XAML bindet die View deklarativ:
// <TextBox Text="{Binding Username}" />
// <Button Command="{Binding LoginCommand}"
//         IsEnabled="{Binding CanLogin}" />

var vm = new LoginViewModel();
vm.PropertyChanged += (_, e) =>
    Console.WriteLine($"UI aktualisiert: {e.PropertyName}");
vm.Username = "anna";   // View würde sich selbst aktualisieren`,
  python:
`# MVVM-Kern nachgebaut: beobachtbares ViewModel
class Observable:
    def __init__(self):
        self._subscribers = []
    def bind(self, callback):
        self._subscribers.append(callback)
    def notify(self, prop, value):
        for cb in self._subscribers:
            cb(prop, value)

class LoginViewModel(Observable):
    def __init__(self):
        super().__init__()
        self._username = ""

    @property
    def username(self): return self._username

    @username.setter
    def username(self, value):
        self._username = value
        self.notify("username", value)
        self.notify("can_login", self.can_login)

    @property
    def can_login(self): return len(self._username) >= 3

    def login(self): print(f"Login als {self._username} ...")

vm = LoginViewModel()
# Die "View" bindet sich an das ViewModel:
vm.bind(lambda prop, val: print(f"UI aktualisiert: {prop}={val}"))
vm.username = "anna"    # UI reagiert automatisch`
},
{
  id:'repository', name:'Repository', cat:'architectural', gof:false, icon:'🗄',
  short:{de:'Kapselt den Datenzugriff hinter einer sammlungsartigen Schnittstelle.',
         en:'Encapsulates data access behind a collection-like interface.'},
  intent:{de:'Das Repository vermittelt zwischen Domäne und Datenhaltung: Die Geschäftslogik spricht mit einer Schnittstelle, die sich wie eine In-Memory-Sammlung anfühlt (GetById, Add, Remove) – ob dahinter SQL, MongoDB oder eine Datei liegt, ist austauschbar. Herzstück testbarer Architektur: Im Test wird das echte Repository einfach durch ein In-Memory-Exemplar ersetzt.',
          en:'The repository mediates between domain and persistence: business logic talks to an interface that feels like an in-memory collection (GetById, Add, Remove) – whether SQL, MongoDB or a file sits behind it is interchangeable. Core of testable architecture: in tests, the real repository is simply replaced by an in-memory one.'},
  analogy:{de:'Die Bibliothekarin: Du sagst „Ich hätte gern das Buch X" – ob es im Keller, im Regal oder in einer anderen Filiale liegt, ist ihr Problem, nicht deins.',
           en:'The librarian: you say "I would like book X" – whether it is in the basement, on a shelf or at another branch is her problem, not yours.'},
  use:{de:['Domänenlogik von Persistenz entkoppeln','Tests ohne echte Datenbank','Datenquelle austauschbar halten (SQL → NoSQL)'],
       en:['Decoupling domain logic from persistence','Tests without a real database','Keeping the data source swappable (SQL → NoSQL)']},
  pros:{de:['Hervorragende Testbarkeit','Zentrale Stelle für Abfragen','Klare Architekturgrenze'],
        en:['Excellent testability','Central place for queries','Clear architectural boundary']},
  cons:{de:['Doppelte Abstraktion über ORMs (EF Core ist schon ein Repository)','Generische Repositories verleiten zu Leaky Abstractions','Mehr Schichten = mehr Code'],
        en:['Double abstraction over ORMs (EF Core already is one)','Generic repositories invite leaky abstractions','More layers = more code']},
  related:['unit-of-work','specification','dependency-injection','facade'],
  csharp:
`public record Product(int Id, string Name, decimal Price);

public interface IProductRepository
{
    Product? GetById(int id);
    IEnumerable<Product> GetAll();
    void Add(Product product);
}

// Produktiv: EF Core / Dapper. Im Test: In-Memory!
public class InMemoryProductRepository : IProductRepository
{
    private readonly Dictionary<int, Product> _store = new();
    public Product? GetById(int id)
        => _store.TryGetValue(id, out var p) ? p : null;
    public IEnumerable<Product> GetAll() => _store.Values;
    public void Add(Product p) => _store[p.Id] = p;
}

// Geschäftslogik kennt NUR das Interface:
public class PricingService(IProductRepository repo)
{
    public decimal TotalInventoryValue()
        => repo.GetAll().Sum(p => p.Price);
}

IProductRepository repo = new InMemoryProductRepository();
repo.Add(new Product(1, "Laptop", 999m));
repo.Add(new Product(2, "Maus", 29m));
Console.WriteLine(new PricingService(repo).TotalInventoryValue());`,
  python:
`from dataclasses import dataclass
from typing import Protocol

@dataclass
class Product:
    id: int
    name: str
    price: float

class ProductRepository(Protocol):        # die Schnittstelle
    def get_by_id(self, id: int) -> Product | None: ...
    def get_all(self) -> list[Product]: ...
    def add(self, product: Product) -> None: ...

class InMemoryProductRepository:          # für Tests/Demo
    def __init__(self): self._store: dict[int, Product] = {}
    def get_by_id(self, id): return self._store.get(id)
    def get_all(self): return list(self._store.values())
    def add(self, p): self._store[p.id] = p

class PricingService:                     # kennt nur das Protokoll
    def __init__(self, repo: ProductRepository):
        self._repo = repo
    def total_inventory_value(self) -> float:
        return sum(p.price for p in self._repo.get_all())

repo = InMemoryProductRepository()
repo.add(Product(1, "Laptop", 999.0))
repo.add(Product(2, "Maus", 29.0))
print(PricingService(repo).total_inventory_value())   # 1028.0`
},
{
  id:'unit-of-work', name:'Unit of Work', cat:'architectural', gof:false, icon:'📑',
  short:{de:'Sammelt alle Änderungen einer Geschäftsaktion und schreibt sie in einer Transaktion.',
         en:'Collects all changes of a business action and writes them in one transaction.'},
  intent:{de:'Eine Unit of Work verfolgt alle Objektänderungen während eines Geschäftsvorgangs (neu, geändert, gelöscht) und persistiert sie am Ende gemeinsam – atomar: alles oder nichts. Entity Framework (DbContext.SaveChanges) und SQLAlchemy (Session.commit) implementieren genau dieses Muster.',
          en:'A unit of work tracks all object changes during a business operation (new, modified, deleted) and persists them together at the end – atomically: all or nothing. Entity Framework (DbContext.SaveChanges) and SQLAlchemy (Session.commit) implement exactly this pattern.'},
  analogy:{de:'Der Einkaufswagen: Du legst alles hinein und bezahlst einmal an der Kasse – nicht jeden Artikel einzeln am Regal.',
           en:'The shopping cart: you put everything in and pay once at the checkout – not each item individually at the shelf.'},
  use:{de:['Mehrere Änderungen müssen atomar erfolgen','Zusammen mit Repository für saubere Persistenz','Änderungsverfolgung über einen Request hinweg'],
       en:['Multiple changes must happen atomically','Together with Repository for clean persistence','Change tracking across a request']},
  pros:{de:['Transaktionale Konsistenz','Weniger DB-Roundtrips (Batching)','Rollback trivial'],
        en:['Transactional consistency','Fewer DB round trips (batching)','Trivial rollback']},
  cons:{de:['ORMs bringen es meist schon mit → nicht doppeln','Lange Units halten Locks/Speicher','Fehlerbehandlung beim Commit zentralisiert sich'],
        en:['ORMs usually ship it already → do not duplicate','Long units hold locks/memory','Error handling centralizes at commit']},
  related:['repository','command','memento'],
  csharp:
`public class UnitOfWork
{
    private readonly List<string> _newEntities = new();
    private readonly List<string> _dirtyEntities = new();

    public void RegisterNew(string e)   => _newEntities.Add(e);
    public void RegisterDirty(string e) => _dirtyEntities.Add(e);

    public void Commit()   // alles-oder-nichts
    {
        Console.WriteLine("BEGIN TRANSACTION");
        try
        {
            foreach (var e in _newEntities)
                Console.WriteLine($"  INSERT {e}");
            foreach (var e in _dirtyEntities)
                Console.WriteLine($"  UPDATE {e}");
            Console.WriteLine("COMMIT ✓");
        }
        catch
        {
            Console.WriteLine("ROLLBACK ✗");
            throw;
        }
    }
}

var uow = new UnitOfWork();
uow.RegisterNew("Order#1001");
uow.RegisterDirty("Customer#42 (Punkte +100)");
uow.Commit();
// Genau so arbeitet EF Core: ctx.Add(...), ctx.SaveChanges()`,
  python:
`class UnitOfWork:
    def __init__(self):
        self._new, self._dirty = [], []

    def register_new(self, entity): self._new.append(entity)
    def register_dirty(self, entity): self._dirty.append(entity)

    # Als Context Manager – pythonisch:
    def __enter__(self): return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            print("BEGIN TRANSACTION")
            for e in self._new:   print(f"  INSERT {e}")
            for e in self._dirty: print(f"  UPDATE {e}")
            print("COMMIT ✓")
        else:
            print("ROLLBACK ✗")
        return False

with UnitOfWork() as uow:
    uow.register_new("Order#1001")
    uow.register_dirty("Customer#42 (Punkte +100)")
# Commit passiert automatisch am Block-Ende.
# Genau so arbeitet SQLAlchemy: session.add(...), session.commit()`
},
{
  id:'publish-subscribe', name:'Publish-Subscribe', cat:'architectural', gof:false, icon:'📡',
  short:{de:'Sender veröffentlichen Nachrichten zu Themen – Empfänger abonnieren Themen. Beide kennen sich nie.',
         en:'Senders publish messages to topics – receivers subscribe to topics. They never know each other.'},
  intent:{de:'Pub/Sub erweitert Observer um einen Broker in der Mitte: Publisher senden Ereignisse an einen Kanal (Topic), Subscriber melden sich beim Kanal an. Sender und Empfänger sind vollständig entkoppelt – zeitlich, örtlich und technologisch. Das Rückgrat von Event-getriebenen Architekturen (Kafka, RabbitMQ, Redis Pub/Sub, MQTT).',
          en:'Pub/sub extends Observer with a broker in the middle: publishers send events to a channel (topic), subscribers register with the channel. Senders and receivers are fully decoupled – in time, place and technology. The backbone of event-driven architectures (Kafka, RabbitMQ, Redis Pub/Sub, MQTT).'},
  analogy:{de:'Ein Zeitungsabo: Der Verlag kennt dich nicht persönlich – er druckt. Die Zustellung organisiert der Vertrieb (Broker), und du bekommst nur die Ressorts, die du abonniert hast.',
           en:'A newspaper subscription: the publisher does not know you personally – it prints. Distribution (the broker) organizes delivery, and you only get the sections you subscribed to.'},
  use:{de:['Microservices-Kommunikation ohne Direktkopplung','Ereignisse an unbekannt viele Empfänger verteilen','In-Process-Eventbusse in modularen Monolithen'],
       en:['Microservice communication without direct coupling','Distributing events to an unknown number of receivers','In-process event buses in modular monoliths']},
  pros:{de:['Maximale Entkopplung von Sender/Empfänger','Neue Subscriber ohne Publisher-Änderung','Skaliert horizontal über Broker'],
        en:['Maximum sender/receiver decoupling','New subscribers without publisher changes','Scales horizontally via brokers']},
  cons:{de:['Ablauf schwerer nachzuvollziehen (wer hört mit?)','Zustellgarantien werden komplex','Broker als zusätzliche Infrastruktur'],
        en:['Flow harder to trace (who is listening?)','Delivery guarantees get complex','Broker as additional infrastructure']},
  related:['observer','mediator','event-sourcing','producer-consumer'],
  demo:'pubsub',
  csharp:
`// Minimaler In-Process-EventBus:
public class EventBus
{
    private readonly Dictionary<string, List<Action<string>>>
        _topics = new();

    public void Subscribe(string topic, Action<string> handler)
    {
        if (!_topics.ContainsKey(topic))
            _topics[topic] = new();
        _topics[topic].Add(handler);
    }

    public void Publish(string topic, string message)
    {
        if (!_topics.TryGetValue(topic, out var subs)) return;
        foreach (var handler in subs) handler(message);
    }
}

var bus = new EventBus();

// Services abonnieren – kennen den Sender NICHT:
bus.Subscribe("order.created",
    m => Console.WriteLine($"📧 Mail-Service: {m}"));
bus.Subscribe("order.created",
    m => Console.WriteLine($"📦 Lager-Service: {m}"));

// Der Shop published – kennt die Empfänger NICHT:
bus.Publish("order.created", "Bestellung #1001 eingegangen");`,
  python:
`from collections import defaultdict
from typing import Callable

class EventBus:
    def __init__(self):
        self._topics: dict[str, list[Callable]] = defaultdict(list)

    def subscribe(self, topic: str, handler: Callable[[str], None]):
        self._topics[topic].append(handler)

    def publish(self, topic: str, message: str):
        for handler in self._topics[topic]:
            handler(message)

bus = EventBus()

# Services abonnieren – kennen den Sender NICHT:
bus.subscribe("order.created",
              lambda m: print(f"📧 Mail-Service: {m}"))
bus.subscribe("order.created",
              lambda m: print(f"📦 Lager-Service: {m}"))

# Der Shop published – kennt die Empfänger NICHT:
bus.publish("order.created", "Bestellung #1001 eingegangen")`
},
{
  id:'cqrs', name:'CQRS', cat:'architectural', gof:false, icon:'⚖',
  short:{de:'Trennt Schreiboperationen (Commands) strikt von Leseoperationen (Queries).',
         en:'Strictly separates write operations (commands) from read operations (queries).'},
  intent:{de:'Command Query Responsibility Segregation: Schreibpfad (Commands ändern Zustand, geben nichts zurück) und Lesepfad (Queries lesen, ändern nichts) bekommen getrennte Modelle – bis hin zu getrennten Datenbanken. Lese- und Schreiblast skalieren unabhängig; Lesemodelle sind exakt auf die UI zugeschnitten. Oft kombiniert mit Event Sourcing und dem Mediator (MediatR).',
          en:'Command Query Responsibility Segregation: the write path (commands change state, return nothing) and read path (queries read, change nothing) get separate models – up to separate databases. Read and write load scale independently; read models are tailored exactly to the UI. Often combined with event sourcing and the mediator (MediatR).'},
  analogy:{de:'Restaurantküche mit Speisekarte: Bestellungen (Commands) gehen in die Küche, die Speisekarte (Query-Modell) ist eine fertig aufbereitete Sicht – niemand liest den Lagerbestand der Küche, um zu erfahren, was es gibt.',
           en:'A kitchen with a menu: orders (commands) go into the kitchen, the menu (query model) is a pre-prepared view – nobody reads the kitchen inventory to know what is available.'},
  use:{de:['Sehr unterschiedliche Lese-/Schreiblast','Komplexe Domänen mit einfachen Anzeige-Anforderungen','Zusammen mit Event Sourcing und Messaging'],
       en:['Very different read/write loads','Complex domains with simple display requirements','Together with event sourcing and messaging']},
  pros:{de:['Unabhängige Skalierung beider Pfade','Schlanke, UI-genaue Lesemodelle','Klarere Absichten im Code (Command vs. Query)'],
        en:['Independent scaling of both paths','Lean, UI-precise read models','Clearer intent in code (command vs. query)']},
  cons:{de:['Eventual Consistency zwischen den Modellen','Deutlich mehr Infrastruktur','Für CRUD-Apps massiv überdimensioniert'],
        en:['Eventual consistency between models','Significantly more infrastructure','Massively oversized for CRUD apps']},
  related:['event-sourcing','mediator','repository','command'],
  csharp:
`// WRITE-Seite: Commands ändern – geben nichts zurück
public record CreateOrderCommand(string Product, int Qty);

public class OrderCommandHandler
{
    public void Handle(CreateOrderCommand cmd)
    {
        Console.WriteLine($"Validiere & speichere: " +
            $"{cmd.Qty}x {cmd.Product}");
        // → Event ans Lesemodell publizieren
        ReadModel.Project(cmd.Product, cmd.Qty);
    }
}

// READ-Seite: eigenes, flaches Modell nur fürs Anzeigen
public static class ReadModel
{
    private static readonly List<string> _orderList = new();
    public static void Project(string product, int qty)
        => _orderList.Add($"{qty}x {product}");
    public static IReadOnlyList<string> GetOrderList()
        => _orderList;   // Query: liest nur!
}

new OrderCommandHandler()
    .Handle(new CreateOrderCommand("Laptop", 2));

foreach (var row in ReadModel.GetOrderList())
    Console.WriteLine($"UI zeigt: {row}");`,
  python:
`from dataclasses import dataclass

# WRITE-Seite: Commands ändern – geben nichts zurück
@dataclass
class CreateOrderCommand:
    product: str
    qty: int

class OrderCommandHandler:
    def __init__(self, read_model):
        self._read_model = read_model

    def handle(self, cmd: CreateOrderCommand):
        print(f"Validiere & speichere: {cmd.qty}x {cmd.product}")
        self._read_model.project(cmd.product, cmd.qty)

# READ-Seite: flaches Modell nur fürs Anzeigen
class OrderReadModel:
    def __init__(self): self._rows: list[str] = []
    def project(self, product, qty):
        self._rows.append(f"{qty}x {product}")
    def get_order_list(self) -> list[str]:
        return list(self._rows)      # Query: liest nur!

read_model = OrderReadModel()
handler = OrderCommandHandler(read_model)
handler.handle(CreateOrderCommand("Laptop", 2))

for row in read_model.get_order_list():
    print(f"UI zeigt: {row}")`
},
{
  id:'event-sourcing', name:'Event Sourcing', cat:'architectural', gof:false, icon:'🎞',
  short:{de:'Speichert nicht den aktuellen Zustand, sondern alle Ereignisse, die zu ihm geführt haben.',
         en:'Stores not the current state but all events that led to it.'},
  intent:{de:'Statt „Kontostand = 150 €" speichert Event Sourcing die Historie: eröffnet, +200, −50. Der Zustand wird durch Abspielen der Events rekonstruiert. Das liefert ein perfektes Audit-Log, Zeitreisen („Zustand von gestern?") und neue Auswertungen auf alten Daten. Preis: höhere Komplexität, Event-Versionierung, meist kombiniert mit CQRS und Snapshots.',
          en:'Instead of "balance = €150", event sourcing stores the history: opened, +200, −50. State is reconstructed by replaying events. This yields a perfect audit log, time travel ("state as of yesterday?") and new analyses on old data. Price: higher complexity, event versioning, usually combined with CQRS and snapshots.'},
  analogy:{de:'Ein Bankkonto-Auszug: Die Bank speichert jede Buchung, nicht nur den Endsaldo – und kann jeden historischen Kontostand exakt belegen.',
           en:'A bank statement: the bank stores every transaction, not just the final balance – and can prove any historical balance exactly.'},
  use:{de:['Audit-Pflicht: Finanzen, Medizin, Verträge','Nachvollziehbarkeit jeder Zustandsänderung','Event-getriebene Microservice-Landschaften'],
       en:['Audit requirements: finance, medicine, contracts','Traceability of every state change','Event-driven microservice landscapes']},
  pros:{de:['Lückenlose, unveränderliche Historie','Debugging: Zustand jedes Zeitpunkts reproduzierbar','Neue Projektionen rückwirkend möglich'],
        en:['Complete, immutable history','Debugging: state of any moment reproducible','New projections possible retroactively']},
  cons:{de:['Deutlich komplexer als CRUD','Event-Schema-Evolution ist anspruchsvoll','Replay großer Streams braucht Snapshots'],
        en:['Significantly more complex than CRUD','Event schema evolution is demanding','Replaying large streams needs snapshots']},
  related:['cqrs','memento','command','publish-subscribe'],
  csharp:
`public abstract record AccountEvent(DateTime At);
public record Opened(DateTime At) : AccountEvent(At);
public record Deposited(DateTime At, decimal Amount) : AccountEvent(At);
public record Withdrawn(DateTime At, decimal Amount) : AccountEvent(At);

public class BankAccount
{
    private readonly List<AccountEvent> _events = new();
    public decimal Balance { get; private set; }

    public void Apply(AccountEvent e)
    {
        Balance += e switch
        {
            Deposited d => d.Amount,
            Withdrawn w => -w.Amount,
            _ => 0
        };
        _events.Add(e);       // Event anhängen – nie ändern!
    }

    // Zustand aus der Historie rekonstruieren:
    public static BankAccount Replay(IEnumerable<AccountEvent> log)
    {
        var acc = new BankAccount();
        foreach (var e in log) acc.Apply(e);
        return acc;
    }
}

var acc = new BankAccount();
acc.Apply(new Opened(DateTime.Now));
acc.Apply(new Deposited(DateTime.Now, 200));
acc.Apply(new Withdrawn(DateTime.Now, 50));
Console.WriteLine(acc.Balance);   // 150 – aus Events berechnet`,
  python:
`from dataclasses import dataclass

@dataclass(frozen=True)
class Deposited:  amount: float
@dataclass(frozen=True)
class Withdrawn:  amount: float

class BankAccount:
    def __init__(self):
        self.events = []        # die einzige Wahrheit!
        self.balance = 0.0

    def apply(self, event):
        if isinstance(event, Deposited):
            self.balance += event.amount
        elif isinstance(event, Withdrawn):
            self.balance -= event.amount
        self.events.append(event)   # anhängen – nie ändern!

    @classmethod
    def replay(cls, event_log):     # Zustand rekonstruieren
        acc = cls()
        for e in event_log:
            acc.apply(e)
        return acc

acc = BankAccount()
acc.apply(Deposited(200))
acc.apply(Withdrawn(50))
print(acc.balance)                     # 150.0

restored = BankAccount.replay(acc.events)
print(restored.balance)                # 150.0 – aus der Historie`
}
);
</script>
