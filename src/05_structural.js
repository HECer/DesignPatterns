<script>
/* ================= STRUKTURMUSTER / STRUCTURAL ================= */
PATTERNS.push(
{
  id:'adapter', name:'Adapter', cat:'structural', gof:true, icon:'🔌',
  short:{de:'Übersetzt eine vorhandene Schnittstelle in die, die der Client erwartet.',
         en:'Translates an existing interface into the one the client expects.'},
  intent:{de:'Der Adapter (auch Wrapper) lässt Klassen zusammenarbeiten, deren Schnittstellen nicht kompatibel sind – ohne deren Code zu ändern. Klassischer Einsatz: Fremdbibliotheken, Altsysteme oder externe APIs an das eigene Domänenmodell anbinden.',
          en:'The adapter (aka wrapper) lets classes work together whose interfaces are incompatible – without changing their code. Classic use: connecting third-party libraries, legacy systems or external APIs to your own domain model.'},
  analogy:{de:'Ein Reisestecker-Adapter: Dein deutscher Stecker passt nicht in die britische Steckdose – der Adapter übersetzt die Form, der Strom fließt trotzdem.',
           en:'A travel plug adapter: your German plug does not fit a UK socket – the adapter translates the shape, electricity still flows.'},
  use:{de:['Fremd-/Legacy-Code mit inkompatibler Schnittstelle nutzen','Externe APIs an das eigene Interface anpassen','Mehrere Datenquellen hinter einer Schnittstelle vereinen'],
       en:['Using third-party/legacy code with an incompatible interface','Adapting external APIs to your own interface','Unifying multiple data sources behind one interface']},
  pros:{de:['Fremdcode bleibt unangetastet','Single Responsibility: Übersetzung isoliert','Nachträglich einführbar'],
        en:['Third-party code stays untouched','Single responsibility: translation isolated','Can be introduced retroactively']},
  cons:{de:['Zusätzliche Indirektionsschicht','Viele Adapter → unübersichtlich','Kann Design-Schwächen kaschieren'],
        en:['Additional layer of indirection','Many adapters → cluttered','May hide design weaknesses']},
  related:['facade','decorator','bridge','proxy'],
  csharp:
`// Vorhandene Fremdbibliothek (nicht änderbar):
public class LegacyPaymentGateway
{
    public void MakeTransaction(double amountInCents)
        => Console.WriteLine($"Legacy: {amountInCents} Cent überwiesen");
}

// Unser Ziel-Interface:
public interface IPaymentProcessor
{
    void Pay(decimal euros);
}

// Der Adapter übersetzt Euro → Cent und Methodennamen:
public class PaymentAdapter(LegacyPaymentGateway legacy)
    : IPaymentProcessor
{
    public void Pay(decimal euros)
        => legacy.MakeTransaction((double)(euros * 100));
}

IPaymentProcessor processor =
    new PaymentAdapter(new LegacyPaymentGateway());
processor.Pay(19.99m);   // Client nutzt NUR das eigene Interface`,
  python:
`# Vorhandene Fremdbibliothek (nicht änderbar):
class LegacyPaymentGateway:
    def make_transaction(self, amount_in_cents: int):
        print(f"Legacy: {amount_in_cents} Cent überwiesen")

# Unser Ziel-Interface (Duck Typing genügt):
class PaymentAdapter:
    def __init__(self, legacy: LegacyPaymentGateway):
        self._legacy = legacy

    def pay(self, euros: float):        # unsere Wunsch-Methode
        self._legacy.make_transaction(int(euros * 100))

processor = PaymentAdapter(LegacyPaymentGateway())
processor.pay(19.99)   # Client nutzt nur das eigene Interface`
},
{
  id:'bridge', name:'Bridge', cat:'structural', gof:true, icon:'🌉',
  short:{de:'Trennt Abstraktion und Implementierung, damit beide unabhängig variieren können.',
         en:'Separates abstraction and implementation so both can vary independently.'},
  intent:{de:'Statt einer explodierenden Klassenhierarchie (RundesRotesFenster, RundesBlauesFenster …) teilt Bridge das Problem in zwei Dimensionen: die Abstraktion (z. B. Fernbedienung) hält eine Referenz auf die Implementierung (z. B. Gerät). Beide Hierarchien wachsen unabhängig – aus m×n Klassen werden m+n.',
          en:'Instead of an exploding class hierarchy (RoundRedWindow, RoundBlueWindow …), Bridge splits the problem into two dimensions: the abstraction (e.g. remote control) holds a reference to the implementation (e.g. device). Both hierarchies grow independently – m×n classes become m+n.'},
  analogy:{de:'Fernbedienung und Gerät: Jede Fernbedienung (einfach, Premium) kann jedes Gerät (TV, Radio) steuern – niemand baut eine „PremiumTVFernbedienung" als eigene Klasse.',
           en:'Remote control and device: every remote (basic, premium) can control every device (TV, radio) – nobody builds a "PremiumTVRemote" as its own class.'},
  use:{de:['Zwei unabhängig variierende Dimensionen (Form × Farbe, UI × Plattform)','Implementierung zur Laufzeit austauschen','Vermeidung kombinatorischer Klassen-Explosion'],
       en:['Two independently varying dimensions (shape × color, UI × platform)','Swapping implementation at runtime','Avoiding combinatorial class explosion']},
  pros:{de:['m+n statt m×n Klassen','Implementierung zur Laufzeit wechselbar','Plattformdetails vor dem Client verborgen'],
        en:['m+n instead of m×n classes','Implementation switchable at runtime','Platform details hidden from client']},
  cons:{de:['Mehr Anfangskomplexität','Bei nur einer Dimension unnötig','Design muss früh geplant werden'],
        en:['More initial complexity','Unnecessary with a single dimension','Design must be planned early']},
  related:['adapter','strategy','abstract-factory'],
  csharp:
`// Implementierungs-Hierarchie:
public interface IDevice
{
    void SetVolume(int percent);
    string Name { get; }
}
public class Tv : IDevice
{
    public string Name => "TV";
    public void SetVolume(int p) => Console.WriteLine($"TV: {p}%");
}
public class Radio : IDevice
{
    public string Name => "Radio";
    public void SetVolume(int p) => Console.WriteLine($"Radio: {p}%");
}

// Abstraktions-Hierarchie – hält die Brücke zur Implementierung:
public class Remote(IDevice device)
{
    protected readonly IDevice Device = device;
    public void VolumeUp() => Device.SetVolume(50);
}
public class PremiumRemote(IDevice device) : Remote(device)
{
    public void Mute() => Device.SetVolume(0);   // Extra-Feature
}

new Remote(new Tv()).VolumeUp();          // TV: 50%
new PremiumRemote(new Radio()).Mute();    // Radio: 0%`,
  python:
`from abc import ABC, abstractmethod

class Device(ABC):                       # Implementierung
    @abstractmethod
    def set_volume(self, percent: int): ...

class Tv(Device):
    def set_volume(self, p): print(f"TV: {p}%")

class Radio(Device):
    def set_volume(self, p): print(f"Radio: {p}%")

class Remote:                            # Abstraktion
    def __init__(self, device: Device):  # ← die "Brücke"
        self._device = device
    def volume_up(self):
        self._device.set_volume(50)

class PremiumRemote(Remote):             # erweiterte Abstraktion
    def mute(self):
        self._device.set_volume(0)

Remote(Tv()).volume_up()          # TV: 50%
PremiumRemote(Radio()).mute()     # Radio: 0%`
},
{
  id:'composite', name:'Composite', cat:'structural', gof:true, icon:'🌳',
  short:{de:'Behandelt einzelne Objekte und Objektgruppen (Bäume) völlig einheitlich.',
         en:'Treats individual objects and object groups (trees) completely uniformly.'},
  intent:{de:'Composite organisiert Objekte in Baumstrukturen und erlaubt es, Blätter (einzelne Elemente) und Container (Gruppen) über dieselbe Schnittstelle anzusprechen. Der Client muss nicht wissen, ob er mit einer Datei oder einem ganzen Ordner arbeitet – Operationen laufen rekursiv durch den Baum.',
          en:'Composite organizes objects into tree structures and lets you address leaves (individual elements) and containers (groups) through the same interface. The client need not know whether it works with a file or a whole folder – operations run recursively through the tree.'},
  analogy:{de:'Ein Umzugskarton: Er kann einzelne Gegenstände oder weitere Kartons enthalten. „Was wiegt der Karton?" beantwortet sich rekursiv – egal wie tief verschachtelt.',
           en:'A moving box: it can contain individual items or more boxes. "How much does the box weigh?" answers itself recursively – no matter how deeply nested.'},
  use:{de:['Hierarchien: Dateisysteme, Menüs, Organigramme, UI-Bäume','Teil-Ganzes-Beziehungen einheitlich behandeln','Rekursive Operationen (Summe, Suche, Rendern)'],
       en:['Hierarchies: file systems, menus, org charts, UI trees','Treating part-whole relationships uniformly','Recursive operations (sum, search, render)']},
  pros:{de:['Client-Code ignoriert Blatt/Container-Unterschied','Beliebig tiefe Verschachtelung','Neue Elementtypen leicht ergänzbar'],
        en:['Client code ignores leaf/container difference','Arbitrarily deep nesting','New element types easy to add']},
  cons:{de:['Zu allgemeine Schnittstelle möglich','Typprüfungen manchmal doch nötig','Zyklen müssen verhindert werden'],
        en:['Interface may become too general','Type checks sometimes still needed','Cycles must be prevented']},
  related:['decorator','iterator','visitor','flyweight'],
  csharp:
`public abstract class FileSystemItem(string name)
{
    public string Name { get; } = name;
    public abstract long GetSize();
}

public class FileItem(string name, long size)
    : FileSystemItem(name)
{
    public override long GetSize() => size;
}

public class Folder(string name) : FileSystemItem(name)
{
    private readonly List<FileSystemItem> _children = new();
    public Folder Add(FileSystemItem item)
    { _children.Add(item); return this; }

    // Rekursion: Ordnergröße = Summe aller Kinder
    public override long GetSize() =>
        _children.Sum(c => c.GetSize());
}

var root = new Folder("projekt")
    .Add(new FileItem("readme.md", 4))
    .Add(new Folder("src")
        .Add(new FileItem("main.cs", 120))
        .Add(new FileItem("utils.cs", 80)));

Console.WriteLine($"{root.Name}: {root.GetSize()} KB");  // 204 KB`,
  python:
`from abc import ABC, abstractmethod

class FileSystemItem(ABC):
    def __init__(self, name): self.name = name
    @abstractmethod
    def get_size(self) -> int: ...

class File(FileSystemItem):
    def __init__(self, name, size):
        super().__init__(name); self.size = size
    def get_size(self): return self.size

class Folder(FileSystemItem):
    def __init__(self, name):
        super().__init__(name); self.children = []
    def add(self, item):
        self.children.append(item); return self
    def get_size(self):              # Rekursion über den Baum
        return sum(c.get_size() for c in self.children)

root = (Folder("projekt")
        .add(File("readme.md", 4))
        .add(Folder("src")
             .add(File("main.py", 120))
             .add(File("utils.py", 80))))

print(f"{root.name}: {root.get_size()} KB")   # 204 KB`
},
{
  id:'decorator', name:'Decorator', cat:'structural', gof:true, icon:'🎁',
  short:{de:'Fügt Objekten zur Laufzeit neue Fähigkeiten hinzu – durch Verschachteln statt Vererben.',
         en:'Adds new capabilities to objects at runtime – by wrapping instead of inheriting.'},
  intent:{de:'Der Decorator umhüllt ein Objekt mit einem gleichartigen Wrapper, der vor oder nach dem Delegieren Zusatzverhalten ausführt. Mehrere Dekoratoren lassen sich stapeln – wie Zwiebelschichten. So entstehen flexible Kombinationen ohne Klassenexplosion. Achtung: Pythons @decorator-Syntax ist verwandt, aber ein Sprachfeature für Funktionen.',
          en:'The decorator wraps an object with a same-typed wrapper that executes additional behavior before or after delegating. Multiple decorators can be stacked – like onion layers. This yields flexible combinations without class explosion. Note: Python’s @decorator syntax is related but is a language feature for functions.'},
  analogy:{de:'Kleidung im Winter: Du „dekorierst" dich mit Pullover, Jacke, Schal – jede Schicht fügt eine Eigenschaft hinzu, und du bleibst dieselbe Person.',
           en:'Winter clothing: you "decorate" yourself with sweater, jacket, scarf – each layer adds a property, and you stay the same person.'},
  use:{de:['Zusatzverhalten ohne Vererbung (Logging, Caching, Kompression)','Kombinierbare Features zur Laufzeit','Erweiterung versiegelter/fremder Klassen'],
       en:['Extra behavior without inheritance (logging, caching, compression)','Combinable features at runtime','Extending sealed/foreign classes']},
  pros:{de:['Verhalten zur Laufzeit kombinierbar','Single Responsibility pro Dekorator','Alternative zu tiefen Vererbungsbäumen'],
        en:['Behavior combinable at runtime','Single responsibility per decorator','Alternative to deep inheritance trees']},
  cons:{de:['Viele kleine Klassen','Reihenfolge der Schichten relevant','Debugging durch Wrapper-Ketten mühsam'],
        en:['Many small classes','Layer order matters','Debugging through wrapper chains is tedious']},
  related:['adapter','composite','proxy','chain-of-responsibility'],
  csharp:
`public interface IDataSource
{
    void Write(string data);
}
public class FileSource : IDataSource
{
    public void Write(string data)
        => Console.WriteLine($"Datei ← '{data}'");
}

// Basis-Dekorator delegiert alles:
public abstract class DataDecorator(IDataSource inner) : IDataSource
{
    public virtual void Write(string data) => inner.Write(data);
}
public class EncryptionDecorator(IDataSource inner)
    : DataDecorator(inner)
{
    public override void Write(string data)
        => base.Write($"verschlüsselt({data})");
}
public class CompressionDecorator(IDataSource inner)
    : DataDecorator(inner)
{
    public override void Write(string data)
        => base.Write($"komprimiert({data})");
}

// Schichten stapeln – Reihenfolge frei wählbar:
IDataSource source =
    new EncryptionDecorator(
        new CompressionDecorator(
            new FileSource()));

source.Write("Geheim");
// Datei ← 'komprimiert(verschlüsselt(Geheim))'`,
  python:
`from abc import ABC, abstractmethod

class DataSource(ABC):
    @abstractmethod
    def write(self, data: str): ...

class FileSource(DataSource):
    def write(self, data): print(f"Datei ← '{data}'")

class EncryptionDecorator(DataSource):
    def __init__(self, inner: DataSource): self._inner = inner
    def write(self, data):
        self._inner.write(f"verschlüsselt({data})")

class CompressionDecorator(DataSource):
    def __init__(self, inner: DataSource): self._inner = inner
    def write(self, data):
        self._inner.write(f"komprimiert({data})")

source = EncryptionDecorator(CompressionDecorator(FileSource()))
source.write("Geheim")
# Datei ← 'komprimiert(verschlüsselt(Geheim))'

# Verwandt, aber ein Sprachfeature: Funktions-Dekoratoren
# @lru_cache, @staticmethod, eigene @log-Decorator etc.`
},
{
  id:'facade', name:'Facade', cat:'structural', gof:true, icon:'🏛',
  short:{de:'Bietet eine einfache Schnittstelle zu einem komplexen Subsystem.',
         en:'Provides a simple interface to a complex subsystem.'},
  intent:{de:'Die Fassade bündelt die Aufrufe an ein kompliziertes Subsystem (viele Klassen, richtige Reihenfolge, Konfiguration) hinter einer einzigen, leicht nutzbaren Schnittstelle. Der Client sieht nur die Fassade; wer Spezialfunktionen braucht, kann weiterhin am Subsystem vorbeigreifen.',
          en:'The facade bundles calls to a complicated subsystem (many classes, correct order, configuration) behind a single easy-to-use interface. The client only sees the facade; anyone needing special features can still bypass it.'},
  analogy:{de:'Ein Reisebüro: Ein Anruf – und Flug, Hotel und Mietwagen sind gebucht. Du könntest alles einzeln organisieren, aber die Fassade nimmt dir die Komplexität ab.',
           en:'A travel agency: one call – and flight, hotel and rental car are booked. You could organize everything individually, but the facade removes the complexity.'},
  use:{de:['Komplexe Bibliotheken hinter einfacher API verbergen','Schichtenarchitektur: klare Einstiegspunkte je Schicht','Entkopplung des Clients von Subsystem-Details'],
       en:['Hiding complex libraries behind a simple API','Layered architecture: clear entry points per layer','Decoupling clients from subsystem details']},
  pros:{de:['Drastisch einfachere Nutzung','Subsystem austauschbar hinter der Fassade','Weniger Kopplung im Client-Code'],
        en:['Drastically simpler usage','Subsystem swappable behind the facade','Less coupling in client code']},
  cons:{de:['Kann zum „Gott-Objekt" anwachsen','Versteckt evtl. nützliche Detailfunktionen','Zusätzliche Schicht bei simplen Systemen'],
        en:['Can grow into a "god object"','May hide useful detail functions','Extra layer for simple systems']},
  related:['adapter','mediator','singleton'],
  csharp:
`// Komplexes Subsystem:
class VideoDecoder { public byte[] Decode(string f) { Console.WriteLine("Dekodiere " + f); return new byte[10]; } }
class AudioMixer   { public byte[] Mix(byte[] v)   { Console.WriteLine("Mische Audio"); return v; } }
class FileExporter { public void Save(byte[] d, string t) { Console.WriteLine("Speichere als " + t); } }

// Die Fassade – EIN einfacher Einstiegspunkt:
public class VideoConverterFacade
{
    public void ConvertToMp4(string file)
    {
        var decoder  = new VideoDecoder();
        var mixer    = new AudioMixer();
        var exporter = new FileExporter();

        var raw   = decoder.Decode(file);
        var mixed = mixer.Mix(raw);
        exporter.Save(mixed, "video.mp4");
        Console.WriteLine("Fertig!");
    }
}

// Client-Code bleibt trivial:
new VideoConverterFacade().ConvertToMp4("urlaub.avi");`,
  python:
`# Komplexes Subsystem:
class VideoDecoder:
    def decode(self, f):
        print(f"Dekodiere {f}"); return b"rohdaten"

class AudioMixer:
    def mix(self, v):
        print("Mische Audio"); return v

class FileExporter:
    def save(self, d, target):
        print(f"Speichere als {target}")

# Die Fassade – EIN einfacher Einstiegspunkt:
class VideoConverterFacade:
    def convert_to_mp4(self, file: str):
        raw   = VideoDecoder().decode(file)
        mixed = AudioMixer().mix(raw)
        FileExporter().save(mixed, "video.mp4")
        print("Fertig!")

# Client-Code bleibt trivial:
VideoConverterFacade().convert_to_mp4("urlaub.avi")`
},
{
  id:'flyweight', name:'Flyweight', cat:'structural', gof:true, icon:'🪶',
  short:{de:'Teilt gemeinsamen Zustand zwischen tausenden Objekten, um massiv Speicher zu sparen.',
         en:'Shares common state between thousands of objects to save massive amounts of memory.'},
  intent:{de:'Flyweight trennt den Zustand eines Objekts in einen intrinsischen Teil (unveränderlich, teilbar – z. B. Textur, Schriftart) und einen extrinsischen Teil (kontextabhängig – z. B. Position). Die intrinsischen Objekte werden in einer Factory gecacht und von allen geteilt. So passen Millionen „Objekte" in den Speicher.',
          en:'Flyweight splits an object’s state into an intrinsic part (immutable, shareable – e.g. texture, font) and an extrinsic part (context-dependent – e.g. position). Intrinsic objects are cached in a factory and shared by all. This fits millions of "objects" into memory.'},
  analogy:{de:'Ein Texteditor speichert nicht 10.000-mal die Glyphe „e" – er speichert sie einmal und merkt sich nur die Positionen aller „e"s.',
           en:'A text editor does not store the glyph "e" 10,000 times – it stores it once and only remembers the positions of all "e"s.'},
  use:{de:['Sehr viele ähnliche Objekte (Partikel, Zeichen, Bäume im Spiel)','RAM ist der Engpass','Intrinsischer Zustand klar abtrennbar'],
       en:['Very many similar objects (particles, glyphs, trees in a game)','RAM is the bottleneck','Intrinsic state clearly separable']},
  pros:{de:['Enorme Speicherersparnis','Zentralisierte gemeinsame Daten','Kombiniert gut mit Composite'],
        en:['Huge memory savings','Centralized shared data','Combines well with Composite']},
  cons:{de:['Code wird komplexer','CPU-Zeit für Kontext-Lookup','Geteilte Objekte müssen immutable sein'],
        en:['Code becomes more complex','CPU time for context lookup','Shared objects must be immutable']},
  related:['composite','singleton','object-pool','prototype'],
  csharp:
`// Intrinsisch (geteilt): Baumart mit Textur – teuer im RAM
public record TreeType(string Name, string Texture);

public static class TreeTypeFactory
{
    private static readonly Dictionary<string, TreeType> _cache = new();
    public static TreeType Get(string name) =>
        _cache.TryGetValue(name, out var t)
            ? t
            : _cache[name] = new TreeType(name, $"{name}.png");
}

// Extrinsisch (individuell): nur Position + Referenz
public record Tree(int X, int Y, TreeType Type);

var forest = new List<Tree>();
var rnd = new Random();
string[] kinds = { "Eiche", "Birke", "Kiefer" };

for (int i = 0; i < 1_000_000; i++)
    forest.Add(new Tree(rnd.Next(1000), rnd.Next(1000),
        TreeTypeFactory.Get(kinds[rnd.Next(3)])));

// 1 Mio. Bäume – aber nur 3 TreeType-Objekte im Speicher!`,
  python:
`import random

class TreeType:                      # intrinsisch – geteilt
    _cache: dict[str, "TreeType"] = {}

    def __init__(self, name):
        self.name = name
        self.texture = f"{name}.png"   # "teuer"

    @classmethod
    def get(cls, name):
        if name not in cls._cache:
            cls._cache[name] = cls(name)
        return cls._cache[name]

class Tree:                          # extrinsisch – individuell
    __slots__ = ("x", "y", "type")   # spart zusätzlich RAM
    def __init__(self, x, y, tree_type):
        self.x, self.y, self.type = x, y, tree_type

kinds = ["Eiche", "Birke", "Kiefer"]
forest = [Tree(random.randrange(1000), random.randrange(1000),
               TreeType.get(random.choice(kinds)))
          for _ in range(1_000_000)]

print(len(TreeType._cache))   # 3 – statt 1.000.000 Texturen!`
},
{
  id:'proxy', name:'Proxy', cat:'structural', gof:true, icon:'🛡',
  short:{de:'Ein Stellvertreter kontrolliert den Zugriff auf das echte Objekt – für Caching, Schutz oder Lazy Loading.',
         en:'A surrogate controls access to the real object – for caching, protection or lazy loading.'},
  intent:{de:'Der Proxy implementiert dieselbe Schnittstelle wie das echte Objekt und schaltet sich davor. Varianten: Virtual Proxy (erzeugt das teure Objekt erst bei Bedarf), Protection Proxy (prüft Rechte), Caching Proxy (merkt sich Ergebnisse), Remote Proxy (versteckt Netzwerkkommunikation – so funktionieren gRPC-Stubs).',
          en:'The proxy implements the same interface as the real object and sits in front of it. Variants: virtual proxy (creates the expensive object on demand), protection proxy (checks permissions), caching proxy (remembers results), remote proxy (hides network communication – this is how gRPC stubs work).'},
  analogy:{de:'Eine Assistenz: Sie nimmt Anrufe für die Chefin entgegen, filtert Unwichtiges, beantwortet Bekanntes selbst – und stellt nur durch, was wirklich zur Chefin muss.',
           en:'An assistant: they take calls for the boss, filter out the unimportant, answer known questions themselves – and only put through what really needs the boss.'},
  use:{de:['Lazy Loading schwerer Objekte (Virtual Proxy)','Zugriffskontrolle und Audit-Logging','Caching teurer Aufrufe, Remote-Zugriffe kapseln'],
       en:['Lazy loading of heavy objects (virtual proxy)','Access control and audit logging','Caching expensive calls, encapsulating remote access']},
  pros:{de:['Kontrolle ohne Änderung des echten Objekts','Lebenszyklus-Management möglich','Transparent für den Client'],
        en:['Control without changing the real object','Lifecycle management possible','Transparent to the client']},
  cons:{de:['Antwortzeiten können steigen','Zusätzliche Komplexitätsschicht','Gefahr von Logik-Duplikaten im Proxy'],
        en:['Response times may increase','Additional complexity layer','Risk of duplicated logic in the proxy']},
  related:['decorator','adapter','lazy-initialization','facade'],
  csharp:
`public interface IWeatherService
{
    string GetForecast(string city);
}

public class RealWeatherService : IWeatherService
{
    public string GetForecast(string city)
    {
        Console.WriteLine($"→ teurer API-Call für {city} ...");
        Thread.Sleep(500);
        return $"{city}: 24°C, sonnig";
    }
}

// Caching Proxy – gleiche Schnittstelle, schaltet sich davor:
public class CachedWeatherService(IWeatherService real)
    : IWeatherService
{
    private readonly Dictionary<string, string> _cache = new();

    public string GetForecast(string city)
    {
        if (_cache.TryGetValue(city, out var hit)) return hit;
        return _cache[city] = real.GetForecast(city);
    }
}

IWeatherService svc =
    new CachedWeatherService(new RealWeatherService());
Console.WriteLine(svc.GetForecast("Berlin"));  // API-Call
Console.WriteLine(svc.GetForecast("Berlin"));  // aus dem Cache!`,
  python:
`import time

class RealWeatherService:
    def get_forecast(self, city: str) -> str:
        print(f"→ teurer API-Call für {city} ...")
        time.sleep(0.5)
        return f"{city}: 24°C, sonnig"

class CachedWeatherService:          # Caching Proxy
    def __init__(self, real: RealWeatherService):
        self._real = real
        self._cache: dict[str, str] = {}

    def get_forecast(self, city: str) -> str:
        if city not in self._cache:
            self._cache[city] = self._real.get_forecast(city)
        return self._cache[city]

svc = CachedWeatherService(RealWeatherService())
print(svc.get_forecast("Berlin"))   # API-Call
print(svc.get_forecast("Berlin"))   # aus dem Cache!`
}
);
</script>
