<script>
/* ================= ERZEUGUNGSMUSTER / CREATIONAL ================= */
PATTERNS.push(
{
  id:'singleton', name:'Singleton', cat:'creational', gof:true, icon:'1',
  short:{de:'Stellt sicher, dass es von einer Klasse genau eine Instanz gibt – mit globalem Zugriffspunkt.',
         en:'Ensures a class has exactly one instance – with a global access point.'},
  intent:{de:'Das Singleton garantiert, dass eine Klasse nur einmal instanziiert wird, und bietet einen zentralen Zugriffspunkt auf diese Instanz. Typisch für Konfigurationen, Logger oder Verbindungs-Pools. Achtung: In modernen Architekturen wird häufig Dependency Injection mit „Singleton-Lifetime" bevorzugt, weil das klassische Singleton Tests erschwert.',
          en:'The Singleton guarantees a class is instantiated only once and provides a central access point to that instance. Typical for configuration, loggers or connection pools. Note: modern architectures often prefer dependency injection with a "singleton lifetime", since the classic Singleton makes testing harder.'},
  analogy:{de:'Eine Regierung: Egal wer regiert – es gibt immer genau eine offizielle Regierung pro Land, und jeder weiß, wie er sie erreicht.',
           en:'A government: no matter who governs – there is always exactly one official government per country, and everyone knows how to reach it.'},
  use:{de:['Genau eine Instanz nötig (Logger, Konfiguration, Cache)','Kontrollierter, globaler Zugriff auf eine Ressource','Lazy-Erzeugung teurer Objekte beim ersten Zugriff'],
       en:['Exactly one instance needed (logger, configuration, cache)','Controlled global access to a resource','Lazy creation of expensive objects on first access']},
  pros:{de:['Garantiert eine einzige Instanz','Lazy Initialization möglich','Spart Ressourcen bei teuren Objekten'],
        en:['Guarantees a single instance','Lazy initialization possible','Saves resources for expensive objects']},
  cons:{de:['Versteckter globaler Zustand → schwer testbar','Verletzt Single-Responsibility-Prinzip','Threading muss explizit abgesichert werden'],
        en:['Hidden global state → hard to test','Violates the single responsibility principle','Threading must be handled explicitly']},
  related:['factory-method','object-pool','dependency-injection','double-checked-locking'],
  csharp:
`// Thread-sicheres Singleton mit Lazy<T> (empfohlener Weg in C#)
public sealed class AppConfig
{
    private static readonly Lazy<AppConfig> _instance =
        new(() => new AppConfig());

    public static AppConfig Instance => _instance.Value;

    public string ConnectionString { get; private set; }

    private AppConfig()   // privater Konstruktor!
    {
        ConnectionString = "Server=localhost;Db=Shop";
        Console.WriteLine("Konfiguration geladen.");
    }
}

// Verwendung:
var cfg = AppConfig.Instance;
Console.WriteLine(cfg.ConnectionString);
// AppConfig.Instance == cfg  → immer dieselbe Instanz`,
  python:
`# Pythonisch: Singleton über Modul-Ebene oder __new__
class AppConfig:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection_string = "Server=localhost;Db=Shop"
            print("Konfiguration geladen.")
        return cls._instance

cfg1 = AppConfig()
cfg2 = AppConfig()
print(cfg1 is cfg2)          # True – dieselbe Instanz
print(cfg1.connection_string)

# Alternative (idiomatisch): einfach ein Modul verwenden –
# Module werden in Python nur einmal importiert.`
},
{
  id:'factory-method', name:'Factory Method', cat:'creational', gof:true, icon:'🏭',
  short:{de:'Definiert eine Schnittstelle zur Objekterzeugung, lässt aber Unterklassen entscheiden, welche Klasse instanziiert wird.',
         en:'Defines an interface for creating objects, but lets subclasses decide which class to instantiate.'},
  intent:{de:'Statt Objekte direkt mit new zu erzeugen, delegiert die Factory Method die Erzeugung an eine überschreibbare Methode. Der aufrufende Code arbeitet nur mit der abstrakten Schnittstelle – neue Produkttypen lassen sich hinzufügen, ohne bestehenden Code zu ändern (Open-Closed-Prinzip).',
          en:'Instead of creating objects directly with new, the factory method delegates creation to an overridable method. Calling code only works with the abstract interface – new product types can be added without changing existing code (open-closed principle).'},
  analogy:{de:'Eine Logistikzentrale plant Transporte, ohne zu wissen, ob ein LKW oder ein Schiff fährt – die jeweilige Filiale (Unterklasse) entscheidet über das Transportmittel.',
           en:'A logistics HQ plans deliveries without knowing whether a truck or a ship is used – the local branch (subclass) decides on the vehicle.'},
  use:{de:['Der konkrete Typ steht erst zur Laufzeit fest','Bibliotheken/Frameworks, die Nutzern Erweiterungspunkte bieten','Wiederverwendung von Objekten statt Neubau kapseln'],
       en:['The concrete type is only known at runtime','Libraries/frameworks offering extension points','Encapsulating reuse of objects instead of rebuilding']},
  pros:{de:['Entkoppelt Erzeuger und Produkte','Open-Closed: neue Produkte ohne Änderungen','Single Responsibility für die Erzeugung'],
        en:['Decouples creators and products','Open-closed: new products without changes','Single responsibility for creation']},
  cons:{de:['Mehr Klassen im Projekt','Für einfache Fälle Overkill','Parallele Klassenhierarchien können entstehen'],
        en:['More classes in the project','Overkill for simple cases','Parallel class hierarchies may emerge']},
  related:['abstract-factory','template-method','prototype'],
  csharp:
`public interface INotification { void Send(string msg); }

public class EmailNotification : INotification
{
    public void Send(string msg) => Console.WriteLine($"E-Mail: {msg}");
}
public class SmsNotification : INotification
{
    public void Send(string msg) => Console.WriteLine($"SMS: {msg}");
}

// Creator mit Factory Method
public abstract class NotificationService
{
    protected abstract INotification Create();   // Factory Method

    public void Notify(string msg)
    {
        INotification n = Create();   // Unterklasse entscheidet
        n.Send(msg);
    }
}
public class EmailService : NotificationService
{
    protected override INotification Create() => new EmailNotification();
}

new EmailService().Notify("Bestellung versandt!");`,
  python:
`from abc import ABC, abstractmethod

class Notification(ABC):
    @abstractmethod
    def send(self, msg: str): ...

class EmailNotification(Notification):
    def send(self, msg): print(f"E-Mail: {msg}")

class SmsNotification(Notification):
    def send(self, msg): print(f"SMS: {msg}")

class NotificationService(ABC):
    @abstractmethod
    def create(self) -> Notification: ...   # Factory Method

    def notify(self, msg: str):
        self.create().send(msg)   # Unterklasse entscheidet

class EmailService(NotificationService):
    def create(self): return EmailNotification()

EmailService().notify("Bestellung versandt!")`
},
{
  id:'abstract-factory', name:'Abstract Factory', cat:'creational', gof:true, icon:'🏗',
  short:{de:'Erzeugt ganze Familien zusammengehöriger Objekte, ohne ihre konkreten Klassen zu nennen.',
         en:'Creates entire families of related objects without naming their concrete classes.'},
  intent:{de:'Eine Abstract Factory bündelt mehrere Factory Methods: Sie liefert Familien von Produkten, die zueinander passen müssen (z. B. Button + Checkbox im selben UI-Stil). Der Client kennt nur die abstrakte Fabrik und die abstrakten Produkte – das konkrete „Theme" wird einmal zentral gewählt.',
          en:'An abstract factory bundles multiple factory methods: it delivers families of products that must match each other (e.g. button + checkbox in the same UI style). The client only knows the abstract factory and abstract products – the concrete "theme" is chosen once, centrally.'},
  analogy:{de:'Ein Möbelhaus mit Stilwelten: Bestellst du „Skandinavisch", passen Sofa, Tisch und Stuhl garantiert zusammen – du musst keine Einzelteile kombinieren.',
           en:'A furniture store with style collections: order "Scandinavian" and sofa, table and chair are guaranteed to match – no combining individual pieces.'},
  use:{de:['Produktfamilien müssen konsistent kombiniert werden','Plattform-/Theme-abhängige Objekterzeugung (Windows/Mac, Hell/Dunkel)','Austauschbarkeit ganzer Produktlinien zur Laufzeit'],
       en:['Product families must be combined consistently','Platform/theme dependent creation (Windows/Mac, light/dark)','Swapping entire product lines at runtime']},
  pros:{de:['Garantiert kompatible Produkte','Konkrete Klassen bleiben isoliert','Produktfamilie zentral austauschbar'],
        en:['Guarantees compatible products','Concrete classes stay isolated','Product family swappable centrally']},
  cons:{de:['Viele Interfaces und Klassen','Neue Produktarten erfordern Änderung aller Fabriken','Erhöhte Einstiegskomplexität'],
        en:['Many interfaces and classes','New product kinds require changing all factories','Higher entry complexity']},
  related:['factory-method','builder','singleton'],
  csharp:
`// Produktfamilie: UI-Elemente in zwei Themes
public interface IButton   { void Render(); }
public interface ICheckbox { void Render(); }

public class DarkButton : IButton
{ public void Render() => Console.WriteLine("[Dunkler Button]"); }
public class DarkCheckbox : ICheckbox
{ public void Render() => Console.WriteLine("[Dunkle Checkbox]"); }
public class LightButton : IButton
{ public void Render() => Console.WriteLine("[Heller Button]"); }
public class LightCheckbox : ICheckbox
{ public void Render() => Console.WriteLine("[Helle Checkbox]"); }

public interface IUiFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}
public class DarkThemeFactory : IUiFactory
{
    public IButton CreateButton() => new DarkButton();
    public ICheckbox CreateCheckbox() => new DarkCheckbox();
}

// Client kennt nur die Interfaces:
IUiFactory factory = new DarkThemeFactory();
factory.CreateButton().Render();
factory.CreateCheckbox().Render();`,
  python:
`from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self): ...

class Checkbox(ABC):
    @abstractmethod
    def render(self): ...

class DarkButton(Button):
    def render(self): print("[Dunkler Button]")
class DarkCheckbox(Checkbox):
    def render(self): print("[Dunkle Checkbox]")

class UiFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...
    @abstractmethod
    def create_checkbox(self) -> Checkbox: ...

class DarkThemeFactory(UiFactory):
    def create_button(self): return DarkButton()
    def create_checkbox(self): return DarkCheckbox()

factory: UiFactory = DarkThemeFactory()
factory.create_button().render()
factory.create_checkbox().render()`
},
{
  id:'builder', name:'Builder', cat:'creational', gof:true, icon:'🧱',
  short:{de:'Baut komplexe Objekte Schritt für Schritt – gleiche Bauschritte, verschiedene Repräsentationen.',
         en:'Builds complex objects step by step – same construction steps, different representations.'},
  intent:{de:'Der Builder trennt die Konstruktion eines komplexen Objekts von seiner Repräsentation. Statt eines Konstruktors mit zehn Parametern („Teleskop-Konstruktor") gibt es sprechende Bauschritte, die in beliebiger Kombination aufgerufen werden. In C# ist die Fluent-Variante mit Methodenverkettung verbreitet, in Python oft Keyword-Argumente oder ebenfalls Fluent-Builder.',
          en:'The builder separates constructing a complex object from its representation. Instead of a constructor with ten parameters ("telescoping constructor") there are expressive build steps that can be called in any combination. In C# the fluent variant with method chaining is common; Python often uses keyword arguments or fluent builders too.'},
  analogy:{de:'Ein Burger-Restaurant: Der Kunde sagt Schritt für Schritt, was auf den Burger soll. Am Ende liefert „build()" den fertigen Burger – niemand muss alle Zutaten in einer einzigen Bestellung aufsagen.',
           en:'A burger restaurant: the customer specifies step by step what goes on the burger. At the end "build()" delivers the finished burger – nobody has to recite all ingredients in one order.'},
  use:{de:['Objekte mit vielen optionalen Parametern','Unveränderliche (immutable) Objekte sauber erzeugen','Gleicher Bauprozess, unterschiedliche Ergebnisse (Director)'],
       en:['Objects with many optional parameters','Cleanly creating immutable objects','Same build process, different results (director)']},
  pros:{de:['Lesbarer als Riesen-Konstruktoren','Schrittweise Konstruktion, Wiederverwendung von Schritten','Ideal für Immutable Objects'],
        en:['More readable than giant constructors','Step-by-step construction, reusable steps','Great for immutable objects']},
  cons:{de:['Zusätzliche Builder-Klasse pro Produkt','Mehr Codezeilen für einfache Objekte','Objekt evtl. unvollständig, wenn build() vergessen wird'],
        en:['Extra builder class per product','More code for simple objects','Object may be incomplete if build() is forgotten']},
  related:['abstract-factory','prototype','composite'],
  csharp:
`public record Pizza(string Size, bool Cheese, bool Salami, bool Veggies);

public class PizzaBuilder
{
    private string _size = "M";
    private bool _cheese, _salami, _veggies;

    public PizzaBuilder Size(string s)  { _size = s;      return this; }
    public PizzaBuilder AddCheese()     { _cheese = true;  return this; }
    public PizzaBuilder AddSalami()     { _salami = true;  return this; }
    public PizzaBuilder AddVeggies()    { _veggies = true; return this; }

    public Pizza Build() => new(_size, _cheese, _salami, _veggies);
}

// Fluent API – liest sich fast wie ein Satz:
Pizza pizza = new PizzaBuilder()
    .Size("XL")
    .AddCheese()
    .AddSalami()
    .Build();

Console.WriteLine(pizza);   // Pizza { Size = XL, Cheese = True, ... }`,
  python:
`from dataclasses import dataclass

@dataclass(frozen=True)          # immutable Produkt
class Pizza:
    size: str
    cheese: bool = False
    salami: bool = False
    veggies: bool = False

class PizzaBuilder:
    def __init__(self):
        self._size, self._cheese = "M", False
        self._salami, self._veggies = False, False

    def size(self, s):      self._size = s;        return self
    def add_cheese(self):   self._cheese = True;   return self
    def add_salami(self):   self._salami = True;   return self
    def add_veggies(self):  self._veggies = True;  return self

    def build(self) -> Pizza:
        return Pizza(self._size, self._cheese,
                     self._salami, self._veggies)

pizza = PizzaBuilder().size("XL").add_cheese().add_salami().build()
print(pizza)`
},
{
  id:'prototype', name:'Prototype', cat:'creational', gof:true, icon:'🧬',
  short:{de:'Erzeugt neue Objekte durch Klonen bestehender Exemplare – statt teurem Neuaufbau.',
         en:'Creates new objects by cloning existing instances – instead of expensive re-construction.'},
  intent:{de:'Das Prototype-Muster kopiert vorhandene Objekte, ohne den Code von deren Klassen abhängig zu machen. Nützlich, wenn die Initialisierung teuer ist (DB-Abfragen, Berechnungen) oder wenn zur Laufzeit konfigurierte Objekte als Vorlage dienen. Wichtig: flacher Klon (shallow) vs. tiefer Klon (deep) – bei verschachtelten Objekten braucht es meist Deep Copy.',
          en:'The prototype pattern copies existing objects without coupling code to their classes. Useful when initialization is expensive (DB queries, computations) or when runtime-configured objects serve as templates. Important: shallow vs. deep clone – nested objects usually need a deep copy.'},
  analogy:{de:'Zellteilung: Eine Zelle erzeugt eine Kopie von sich selbst – niemand baut die neue Zelle von Grund auf zusammen.',
           en:'Cell division: a cell creates a copy of itself – nobody assembles the new cell from scratch.'},
  use:{de:['Objekterzeugung ist teurer als Kopieren','Viele ähnliche Objekte mit kleinen Abweichungen','Konfigurierte Vorlagen zur Laufzeit duplizieren'],
       en:['Creating is more expensive than copying','Many similar objects with small variations','Duplicating configured templates at runtime']},
  pros:{de:['Klonen ohne Kopplung an konkrete Klassen','Spart teure Initialisierung','Vorlagen statt vieler Unterklassen'],
        en:['Cloning without coupling to concrete classes','Saves expensive initialization','Templates instead of many subclasses']},
  cons:{de:['Deep Copy bei Zyklen/Verschachtelung knifflig','Clone-Logik muss gepflegt werden','Versteckte Abhängigkeiten im Klon möglich'],
        en:['Deep copy is tricky with cycles/nesting','Clone logic must be maintained','Hidden dependencies may survive in the clone']},
  related:['abstract-factory','memento','flyweight'],
  csharp:
`public class Document
{
    public string Title { get; set; } = "";
    public List<string> Tags { get; set; } = new();

    // Deep Clone – Liste wird mitkopiert!
    public Document Clone() => new()
    {
        Title = Title,
        Tags  = new List<string>(Tags)
    };
}

var template = new Document
{
    Title = "Rechnungsvorlage",
    Tags  = { "intern", "finanzen" }
};

var invoice = template.Clone();
invoice.Title = "Rechnung #2026-101";
invoice.Tags.Add("kunde-42");

Console.WriteLine(template.Tags.Count);  // 2 – Vorlage unberührt
Console.WriteLine(invoice.Tags.Count);   // 3`,
  python:
`import copy

class Document:
    def __init__(self, title, tags=None):
        self.title = title
        self.tags = tags or []

    def clone(self):
        return copy.deepcopy(self)   # tiefer Klon

template = Document("Rechnungsvorlage", ["intern", "finanzen"])

invoice = template.clone()
invoice.title = "Rechnung #2026-101"
invoice.tags.append("kunde-42")

print(len(template.tags))   # 2 – Vorlage unberührt
print(len(invoice.tags))    # 3

# copy.copy(x)      → flacher Klon (Referenzen geteilt!)
# copy.deepcopy(x)  → tiefer Klon (alles kopiert)`
},
{
  id:'object-pool', name:'Object Pool', cat:'creational', gof:false, icon:'♻',
  short:{de:'Hält teure Objekte in einem Pool bereit und verleiht sie, statt sie ständig neu zu erzeugen.',
         en:'Keeps expensive objects in a pool and lends them out instead of constantly creating new ones.'},
  intent:{de:'Wenn Objekte teuer in der Erzeugung sind (DB-Verbindungen, Threads, große Puffer), verwaltet ein Object Pool wiederverwendbare Instanzen: Ausleihen → Nutzen → Zurückgeben. Praktisch jede Datenbank-Bibliothek nutzt intern Connection Pooling. Wichtig ist das Zurücksetzen des Zustands bei Rückgabe.',
          en:'When objects are expensive to create (DB connections, threads, large buffers), an object pool manages reusable instances: borrow → use → return. Virtually every database library uses connection pooling internally. Resetting state on return is essential.'},
  analogy:{de:'Eine Bibliothek: Bücher werden ausgeliehen und zurückgebracht – niemand druckt für jeden Leser ein neues Exemplar.',
           en:'A library: books are borrowed and returned – nobody prints a new copy for every reader.'},
  use:{de:['Teure Erzeugung: Verbindungen, Threads, Puffer','Hohe Frequenz von Anfrage/Freigabe','Begrenzung gleichzeitiger Ressourcen (max. N Verbindungen)'],
       en:['Expensive creation: connections, threads, buffers','High frequency of acquire/release','Limiting concurrent resources (max N connections)']},
  pros:{de:['Deutlich weniger Allokationen/GC-Druck','Vorhersagbare Ressourcen-Obergrenze','Latenz sinkt bei heißen Pfaden'],
        en:['Far fewer allocations/GC pressure','Predictable resource ceiling','Lower latency on hot paths']},
  cons:{de:['Zustands-Reset leicht zu vergessen → Bugs','Zusätzliche Komplexität (Thread-Sicherheit)','Bei billigen Objekten kontraproduktiv'],
        en:['Easy to forget state reset → bugs','Extra complexity (thread safety)','Counterproductive for cheap objects']},
  related:['singleton','flyweight','thread-pool'],
  csharp:
`using System.Collections.Concurrent;

public class Connection
{
    public int Id { get; }
    public Connection(int id) { Id = id; Thread.Sleep(100); } // teuer!
}

public class ConnectionPool
{
    private readonly ConcurrentBag<Connection> _pool = new();
    private int _created;

    public Connection Rent() =>
        _pool.TryTake(out var c)
            ? c
            : new Connection(Interlocked.Increment(ref _created));

    public void Return(Connection c) => _pool.Add(c);
}

var pool = new ConnectionPool();
var conn = pool.Rent();          // beim 1. Mal: neu (langsam)
Console.WriteLine($"Nutze Verbindung {conn.Id}");
pool.Return(conn);               // zurück in den Pool
var again = pool.Rent();         // sofort – recycelt!
// .NET bietet fertig: Microsoft.Extensions.ObjectPool`,
  python:
`import queue, time

class Connection:
    _counter = 0
    def __init__(self):
        Connection._counter += 1
        self.id = Connection._counter
        time.sleep(0.1)            # teure Erzeugung simulieren

class ConnectionPool:
    def __init__(self, size=2):
        self._pool = queue.Queue()
        for _ in range(size):      # Pool vorbefüllen
            self._pool.put(Connection())

    def rent(self) -> Connection:
        return self._pool.get()    # blockiert, wenn leer

    def give_back(self, conn):
        self._pool.put(conn)

pool = ConnectionPool(size=2)
conn = pool.rent()
print(f"Nutze Verbindung {conn.id}")
pool.give_back(conn)               # recyceln statt wegwerfen`
},
{
  id:'lazy-initialization', name:'Lazy Initialization', cat:'creational', gof:false, icon:'💤',
  short:{de:'Erzeugt ein Objekt oder einen Wert erst dann, wenn er zum ersten Mal wirklich gebraucht wird.',
         en:'Creates an object or value only when it is actually needed for the first time.'},
  intent:{de:'Lazy Initialization verschiebt teure Arbeit (Objekterzeugung, Berechnung, Laden von Daten) auf den Moment des ersten Zugriffs. Das beschleunigt den Programmstart und spart Ressourcen für Dinge, die vielleicht nie gebraucht werden. C# bringt dafür Lazy&lt;T&gt; mit, Python löst es elegant mit @cached_property.',
          en:'Lazy initialization defers expensive work (object creation, computation, data loading) to the moment of first access. This speeds up program start and saves resources for things that may never be needed. C# ships Lazy<T> for this; Python solves it elegantly with @cached_property.'},
  analogy:{de:'Ein Restaurant kocht das Gericht erst, wenn es bestellt wird – nicht morgens auf Verdacht alle Gerichte der Karte.',
           en:'A restaurant cooks a dish only when ordered – not every menu item in the morning just in case.'},
  use:{de:['Teure Objekte, die nicht immer gebraucht werden','Schnellerer Anwendungsstart','Zyklische Abhängigkeiten entschärfen'],
       en:['Expensive objects not always needed','Faster application startup','Defusing cyclic dependencies']},
  pros:{de:['Ressourcen nur bei Bedarf','Einfach mit Bordmitteln umsetzbar','Kombinierbar mit Singleton/Proxy'],
        en:['Resources only on demand','Easy with built-in tools','Combinable with Singleton/Proxy']},
  cons:{de:['Erster Zugriff ist langsamer (Latenz-Spike)','Thread-Sicherheit beachten','Fehler treten erst spät auf'],
        en:['First access is slower (latency spike)','Mind thread safety','Errors surface late']},
  related:['singleton','proxy','virtual-proxy'],
  csharp:
`public class ReportService
{
    // Wird erst beim ersten Zugriff auf .Value erzeugt –
    // Lazy<T> ist standardmäßig thread-sicher.
    private readonly Lazy<byte[]> _bigTemplate =
        new(() =>
        {
            Console.WriteLine("Lade 50-MB-Vorlage ...");
            return File.ReadAllBytes("template.bin");
        });

    public void PrintReport()
    {
        var data = _bigTemplate.Value;   // hier passiert das Laden
        Console.WriteLine($"Report mit {data.Length} Bytes erstellt");
    }
}

var svc = new ReportService();
Console.WriteLine("Service erstellt – noch nichts geladen.");
svc.PrintReport();   // erst jetzt wird geladen
svc.PrintReport();   // gecached – kein zweites Laden`,
  python:
`from functools import cached_property

class ReportService:
    @cached_property           # berechnet einmal, dann gecached
    def big_template(self) -> bytes:
        print("Lade 50-MB-Vorlage ...")
        with open("template.bin", "rb") as f:
            return f.read()

    def print_report(self):
        data = self.big_template     # 1. Zugriff lädt, danach Cache
        print(f"Report mit {len(data)} Bytes erstellt")

svc = ReportService()
print("Service erstellt – noch nichts geladen.")
svc.print_report()   # erst jetzt wird geladen
svc.print_report()   # gecached – kein zweites Laden`
},
{
  id:'multiton', name:'Multiton', cat:'creational', gof:false, icon:'🗂',
  short:{de:'Wie Singleton – aber mit genau einer Instanz pro Schlüssel (z. B. pro Mandant oder Region).',
         en:'Like Singleton – but with exactly one instance per key (e.g. per tenant or region).'},
  intent:{de:'Das Multiton verwaltet eine Map von benannten Instanzen: Pro Schlüssel existiert höchstens ein Objekt, das bei Bedarf erzeugt und danach wiederverwendet wird. Typische Fälle: ein Logger pro Kategorie, eine Verbindung pro Datenbank, eine Konfiguration pro Mandant.',
          en:'The multiton manages a map of named instances: at most one object exists per key, created on demand and reused afterwards. Typical cases: one logger per category, one connection per database, one configuration per tenant.'},
  analogy:{de:'Schließfächer am Bahnhof: Pro Schlüsselnummer gibt es genau ein Fach – aber es gibt viele Fächer.',
           en:'Lockers at a train station: exactly one locker per key number – but there are many lockers.'},
  use:{de:['Eine Instanz pro Kontext (Mandant, Region, Kategorie)','Zentrale Registry teurer Objekte','Logger-Frameworks (GetLogger("name"))'],
       en:['One instance per context (tenant, region, category)','Central registry of expensive objects','Logger frameworks (GetLogger("name"))']},
  pros:{de:['Kontrollierte Instanzen pro Schlüssel','Lazy-Erzeugung inklusive','Zentraler Überblick über alle Instanzen'],
        en:['Controlled instances per key','Lazy creation included','Central overview of all instances']},
  cons:{de:['Globaler Zustand wie beim Singleton','Speicher wächst mit Schlüsselanzahl','Thread-Sicherheit erforderlich'],
        en:['Global state like Singleton','Memory grows with key count','Thread safety required']},
  related:['singleton','flyweight','registry'],
  csharp:
`using System.Collections.Concurrent;

public sealed class TenantConfig
{
    private static readonly
        ConcurrentDictionary<string, TenantConfig> _instances = new();

    public string Tenant { get; }
    private TenantConfig(string tenant)
    {
        Tenant = tenant;
        Console.WriteLine($"Config für '{tenant}' geladen");
    }

    public static TenantConfig For(string tenant) =>
        _instances.GetOrAdd(tenant, t => new TenantConfig(t));
}

var a1 = TenantConfig.For("acme");     // erzeugt
var a2 = TenantConfig.For("acme");     // wiederverwendet
var b  = TenantConfig.For("globex");   // erzeugt
Console.WriteLine(ReferenceEquals(a1, a2));   // True`,
  python:
`class TenantConfig:
    _instances: dict[str, "TenantConfig"] = {}

    def __init__(self, tenant: str):
        self.tenant = tenant
        print(f"Config für '{tenant}' geladen")

    @classmethod
    def for_tenant(cls, tenant: str) -> "TenantConfig":
        if tenant not in cls._instances:
            cls._instances[tenant] = cls(tenant)
        return cls._instances[tenant]

a1 = TenantConfig.for_tenant("acme")     # erzeugt
a2 = TenantConfig.for_tenant("acme")     # wiederverwendet
b  = TenantConfig.for_tenant("globex")   # erzeugt
print(a1 is a2)   # True`
},
{
  id:'dependency-injection', name:'Dependency Injection', cat:'creational', gof:false, icon:'💉',
  short:{de:'Objekte bekommen ihre Abhängigkeiten von außen geliefert, statt sie selbst zu erzeugen.',
         en:'Objects receive their dependencies from outside instead of creating them themselves.'},
  intent:{de:'Dependency Injection (DI) ist die praktische Umsetzung des Inversion-of-Control-Prinzips: Eine Klasse deklariert, was sie braucht (meist per Konstruktor), und ein Aufrufer oder DI-Container liefert die konkrete Implementierung. Das macht Code testbar (Mocks!), austauschbar und entkoppelt. In ASP.NET Core ist DI fest eingebaut; in Python genügt oft schlichte Konstruktor-Übergabe.',
          en:'Dependency injection (DI) is the practical implementation of the inversion-of-control principle: a class declares what it needs (usually via constructor) and a caller or DI container supplies the concrete implementation. This makes code testable (mocks!), swappable and decoupled. ASP.NET Core has DI built in; in Python plain constructor passing often suffices.'},
  analogy:{de:'Ein Koch bringt nicht sein eigenes Gemüse mit – die Küche stellt ihm die Zutaten bereit. So kann dieselbe Rezeptur mit Bio-, Regional- oder Testzutaten gekocht werden.',
           en:'A chef does not bring their own vegetables – the kitchen provides ingredients. The same recipe can thus be cooked with organic, regional or test ingredients.'},
  use:{de:['Testbarkeit: echte Services durch Mocks ersetzen','Austauschbare Implementierungen (DB, Mail, Cache)','Zentrale Lebenszyklus-Verwaltung (Singleton/Scoped/Transient)'],
       en:['Testability: replace real services with mocks','Swappable implementations (DB, mail, cache)','Central lifecycle management (singleton/scoped/transient)']},
  pros:{de:['Lose Kopplung, hohe Testbarkeit','Abhängigkeiten explizit sichtbar','Konfiguration an einer Stelle'],
        en:['Loose coupling, high testability','Dependencies explicitly visible','Configuration in one place']},
  cons:{de:['Indirektion: Wo kommt das Objekt her?','Container-Magie kann Debugging erschweren','Überkonfiguration bei kleinen Projekten'],
        en:['Indirection: where does the object come from?','Container magic can hinder debugging','Over-configuration in small projects']},
  related:['singleton','factory-method','strategy'],
  csharp:
`public interface IMailer { void Send(string to, string text); }

public class SmtpMailer : IMailer
{
    public void Send(string to, string text) =>
        Console.WriteLine($"SMTP an {to}: {text}");
}

// Die Klasse ERZEUGT ihre Abhängigkeit nicht – sie BEKOMMT sie:
public class OrderService(IMailer mailer)   // Primary Constructor
{
    public void PlaceOrder(string customer)
    {
        Console.WriteLine("Bestellung gespeichert.");
        mailer.Send(customer, "Danke für deine Bestellung!");
    }
}

// Komposition am Startpunkt (oder via ASP.NET-Container):
// services.AddScoped<IMailer, SmtpMailer>();
var service = new OrderService(new SmtpMailer());
service.PlaceOrder("kunde@example.com");

// Im Test: new OrderService(new FakeMailer()) – kein SMTP nötig!`,
  python:
`from typing import Protocol

class Mailer(Protocol):                 # strukturelles Interface
    def send(self, to: str, text: str) -> None: ...

class SmtpMailer:
    def send(self, to, text):
        print(f"SMTP an {to}: {text}")

class FakeMailer:                       # für Tests
    def __init__(self): self.sent = []
    def send(self, to, text): self.sent.append((to, text))

class OrderService:
    def __init__(self, mailer: Mailer):   # Injektion!
        self._mailer = mailer

    def place_order(self, customer: str):
        print("Bestellung gespeichert.")
        self._mailer.send(customer, "Danke für deine Bestellung!")

OrderService(SmtpMailer()).place_order("kunde@example.com")

fake = FakeMailer()                     # Test ohne echtes SMTP:
OrderService(fake).place_order("test@example.com")
print(fake.sent)`
}
);
</script>
