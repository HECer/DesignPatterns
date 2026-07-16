<script>
/* ================= NEBENLÄUFIGKEIT / CONCURRENCY ================= */
PATTERNS.push(
{
  id:'producer-consumer', name:'Producer-Consumer', cat:'concurrency', gof:false, icon:'📦',
  short:{de:'Entkoppelt Erzeuger und Verarbeiter über eine thread-sichere Warteschlange.',
         en:'Decouples producers and processors via a thread-safe queue.'},
  intent:{de:'Producer legen Arbeitspakete in eine Queue, Consumer entnehmen und verarbeiten sie – in eigenem Tempo und eigener Anzahl. Die Queue puffert Lastspitzen ab und synchronisiert die Threads. Grundlage vieler Systeme: Message Broker (RabbitMQ, Kafka), Logging-Pipelines, Hintergrund-Worker.',
          en:'Producers put work items into a queue, consumers take and process them – at their own pace and count. The queue buffers load spikes and synchronizes the threads. Foundation of many systems: message brokers (RabbitMQ, Kafka), logging pipelines, background workers.'},
  analogy:{de:'Die Küche im Restaurant: Kellner (Producer) hängen Bestellungen an die Leiste, Köche (Consumer) arbeiten sie ab – niemand wartet direkt auf den anderen.',
           en:'A restaurant kitchen: waiters (producers) pin orders to the rail, cooks (consumers) work through them – nobody waits directly for the other.'},
  use:{de:['Lastspitzen puffern (Uploads, Bestellungen)','Langsame Verarbeitung von schneller Erzeugung entkoppeln','Work-Verteilung auf mehrere Worker-Threads'],
       en:['Buffering load spikes (uploads, orders)','Decoupling slow processing from fast production','Distributing work to multiple worker threads']},
  pros:{de:['Natürliche Entkopplung und Skalierung','Backpressure über begrenzte Queue möglich','Threads sauber synchronisiert'],
        en:['Natural decoupling and scaling','Backpressure via bounded queue possible','Threads cleanly synchronized']},
  cons:{de:['Queue-Überlauf muss bedacht werden','Reihenfolge-Garantien kosten extra','Shutdown-Koordination nötig (Poison Pill)'],
        en:['Queue overflow must be considered','Ordering guarantees cost extra','Shutdown coordination needed (poison pill)']},
  related:['thread-pool','observer','publish-subscribe','mediator'],
  csharp:
`using System.Threading.Channels;

// Modern in C#: System.Threading.Channels
var channel = Channel.CreateBounded<string>(capacity: 10);

// Producer:
var producer = Task.Run(async () =>
{
    for (int i = 1; i <= 5; i++)
    {
        await channel.Writer.WriteAsync($"Bestellung #{i}");
        Console.WriteLine($"→ Bestellung #{i} aufgegeben");
    }
    channel.Writer.Complete();   // Signal: fertig
});

// Consumer (könnte mehrfach laufen):
var consumer = Task.Run(async () =>
{
    await foreach (var order in channel.Reader.ReadAllAsync())
    {
        await Task.Delay(200);   // Verarbeitung simulieren
        Console.WriteLine($"✓ {order} zubereitet");
    }
});

await Task.WhenAll(producer, consumer);`,
  python:
`import queue, threading, time

q: "queue.Queue[str|None]" = queue.Queue(maxsize=10)

def producer():
    for i in range(1, 6):
        q.put(f"Bestellung #{i}")        # blockiert, wenn voll
        print(f"→ Bestellung #{i} aufgegeben")
    q.put(None)                          # Poison Pill: fertig

def consumer():
    while True:
        order = q.get()                  # blockiert, wenn leer
        if order is None:
            break
        time.sleep(0.2)                  # Verarbeitung simulieren
        print(f"✓ {order} zubereitet")
        q.task_done()

t1 = threading.Thread(target=producer)
t2 = threading.Thread(target=consumer)
t1.start(); t2.start()
t1.join(); t2.join()`
},
{
  id:'thread-pool', name:'Thread Pool', cat:'concurrency', gof:false, icon:'🧵',
  short:{de:'Wiederverwendet eine feste Gruppe von Threads für viele kleine Aufgaben.',
         en:'Reuses a fixed group of threads for many small tasks.'},
  intent:{de:'Threads zu erzeugen ist teuer. Ein Thread Pool hält eine begrenzte Anzahl von Arbeiter-Threads bereit, die Aufgaben aus einer Warteschlange abarbeiten. Das begrenzt gleichzeitige Threads (Schutz vor Überlast) und spart Erzeugungskosten. Beide Sprachen liefern fertige Pools: Task/ThreadPool in .NET, concurrent.futures in Python.',
          en:'Creating threads is expensive. A thread pool keeps a limited number of worker threads that process tasks from a queue. This caps concurrent threads (overload protection) and saves creation costs. Both languages ship ready-made pools: Task/ThreadPool in .NET, concurrent.futures in Python.'},
  analogy:{de:'Taxis am Bahnhof: Eine feste Flotte bedient nacheinander alle Fahrgäste – niemand baut für jede Fahrt ein neues Taxi.',
           en:'Taxis at a station: a fixed fleet serves all passengers one after another – nobody builds a new taxi for each ride.'},
  use:{de:['Viele kurze, unabhängige Aufgaben','Anzahl paralleler Arbeiten begrenzen','I/O-lastige Aufgaben parallelisieren (Downloads, API-Calls)'],
       en:['Many short independent tasks','Limiting the number of parallel jobs','Parallelizing I/O-heavy tasks (downloads, API calls)']},
  pros:{de:['Keine Thread-Erzeugungskosten pro Aufgabe','Ressourcen-Obergrenze eingebaut','Fertige Implementierungen in beiden Sprachen'],
        en:['No thread creation cost per task','Built-in resource ceiling','Ready implementations in both languages']},
  cons:{de:['Falsche Poolgröße → Stau oder Verschwendung','Lange Blockierer verstopfen den Pool','Debugging paralleler Aufgaben schwieriger'],
        en:['Wrong pool size → congestion or waste','Long blockers clog the pool','Debugging parallel tasks is harder']},
  related:['producer-consumer','object-pool','future-promise'],
  csharp:
`// .NET verwaltet den ThreadPool automatisch über Task:
var urls = new[] { "seite-a", "seite-b", "seite-c", "seite-d" };

async Task<string> DownloadAsync(string url)
{
    Console.WriteLine($"Lade {url} " +
        $"(Thread {Environment.CurrentManagedThreadId})");
    await Task.Delay(300);            // I/O simulieren
    return $"{url}: 200 OK";
}

// Alle Aufgaben laufen auf Pool-Threads:
var results = await Task.WhenAll(urls.Select(DownloadAsync));

foreach (var r in results)
    Console.WriteLine(r);

// Parallelität gezielt begrenzen:
var options = new ParallelOptions { MaxDegreeOfParallelism = 2 };
await Parallel.ForEachAsync(urls, options,
    async (url, _) => await DownloadAsync(url));`,
  python:
`from concurrent.futures import ThreadPoolExecutor
import threading, time

urls = ["seite-a", "seite-b", "seite-c", "seite-d"]

def download(url: str) -> str:
    print(f"Lade {url} ({threading.current_thread().name})")
    time.sleep(0.3)                  # I/O simulieren
    return f"{url}: 200 OK"

# Pool mit max. 2 gleichzeitigen Threads:
with ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(download, urls))

for r in results:
    print(r)

# Für CPU-lastige Arbeit: ProcessPoolExecutor
# (umgeht das GIL durch echte Prozesse)`
},
{
  id:'future-promise', name:'Future / Promise', cat:'concurrency', gof:false, icon:'🔮',
  short:{de:'Ein Platzhalter für ein Ergebnis, das erst in der Zukunft fertig wird.',
         en:'A placeholder for a result that will only be ready in the future.'},
  intent:{de:'Ein Future/Promise repräsentiert das Ergebnis einer laufenden asynchronen Operation. Der Aufrufer bekommt sofort das Platzhalter-Objekt und entscheidet selbst, wann er wartet oder Folgeaktionen verkettet. Das async/await-Keyword beider Sprachen ist Syntax-Zucker über genau diesem Muster (Task in C#, Future/Coroutine in Python).',
          en:'A future/promise represents the result of an ongoing asynchronous operation. The caller immediately receives the placeholder object and decides when to wait or chain follow-up actions. The async/await keywords of both languages are syntactic sugar over exactly this pattern (Task in C#, Future/coroutine in Python).'},
  analogy:{de:'Der Pieper beim Bäcker: Du bestellst, bekommst sofort einen Pieper (das Future) und kannst dich hinsetzen. Wenn er summt, holst du das fertige Ergebnis ab.',
           en:'The buzzer at a bakery: you order, immediately get a buzzer (the future) and can sit down. When it buzzes, you pick up the finished result.'},
  use:{de:['Nicht-blockierende I/O-Aufrufe (HTTP, DB, Dateien)','Mehrere Operationen parallel starten, später einsammeln','Ergebnis-Verkettung: dann-mach-dies-Pipelines'],
       en:['Non-blocking I/O calls (HTTP, DB, files)','Starting several operations in parallel, collecting later','Result chaining: then-do-this pipelines']},
  pros:{de:['Aufrufer bleibt reaktionsfähig','Komposition: WhenAll, gather, Verkettung','Fehler wandern strukturiert mit'],
        en:['Caller stays responsive','Composition: WhenAll, gather, chaining','Errors propagate in a structured way']},
  cons:{de:['Async „färbt" die Aufrufkette ein','Vergessenes await = stiller Fehler','Debugging von Async-Stacks gewöhnungsbedürftig'],
        en:['Async "colors" the call chain','Forgotten await = silent bug','Debugging async stacks takes getting used to']},
  related:['thread-pool','producer-consumer','proxy'],
  csharp:
`// Task<T> IST das Future in C#:
async Task<decimal> FetchPriceAsync(string shop)
{
    Console.WriteLine($"Frage {shop} an ...");
    await Task.Delay(500);            // Netzwerk simulieren
    return shop == "A" ? 19.99m : 17.49m;
}

// Beide Anfragen laufen GLEICHZEITIG:
Task<decimal> priceA = FetchPriceAsync("A");   // sofort zurück!
Task<decimal> priceB = FetchPriceAsync("B");

Console.WriteLine("Beide Anfragen laufen ...");

decimal[] prices = await Task.WhenAll(priceA, priceB);
Console.WriteLine($"Bester Preis: {prices.Min()} €");

// Gesamtdauer: ~500 ms statt 1000 ms sequenziell.`,
  python:
`import asyncio

async def fetch_price(shop: str) -> float:
    print(f"Frage {shop} an ...")
    await asyncio.sleep(0.5)          # Netzwerk simulieren
    return 19.99 if shop == "A" else 17.49

async def main():
    # Beide Coroutinen laufen GLEICHZEITIG:
    task_a = asyncio.create_task(fetch_price("A"))
    task_b = asyncio.create_task(fetch_price("B"))

    print("Beide Anfragen laufen ...")

    prices = await asyncio.gather(task_a, task_b)
    print(f"Bester Preis: {min(prices)} €")

asyncio.run(main())
# Gesamtdauer: ~0,5 s statt 1 s sequenziell.

# Thread-basiert: concurrent.futures.Future
# pool.submit(fn) → Future mit .result()`
},
{
  id:'read-write-lock', name:'Read-Write Lock', cat:'concurrency', gof:false, icon:'🔐',
  short:{de:'Viele dürfen gleichzeitig lesen – aber nur einer exklusiv schreiben.',
         en:'Many may read simultaneously – but only one may write exclusively.'},
  intent:{de:'Ein normales Lock blockiert alle. Ein Read-Write Lock unterscheidet: Beliebig viele Leser dürfen parallel zugreifen, ein Schreiber sperrt exklusiv. Das steigert den Durchsatz massiv, wenn Lesezugriffe dominieren – der typische Fall bei Caches und Konfigurationen.',
          en:'A normal lock blocks everyone. A read-write lock distinguishes: any number of readers may access in parallel, one writer locks exclusively. This massively improves throughput when reads dominate – the typical case for caches and configurations.'},
  analogy:{de:'Ein Museum: Hunderte Besucher betrachten gleichzeitig das Gemälde. Nur wenn der Restaurator arbeitet, wird der Saal komplett gesperrt.',
           en:'A museum: hundreds of visitors view the painting at once. Only when the restorer works is the room completely closed.'},
  use:{de:['Cache/Konfiguration: 95 % Lesen, 5 % Schreiben','Geteilte Datenstrukturen mit Lese-Dominanz','Durchsatz-kritische parallele Systeme'],
       en:['Cache/configuration: 95% reads, 5% writes','Shared data structures dominated by reads','Throughput-critical parallel systems']},
  pros:{de:['Parallele Leser = hoher Durchsatz','Schreibzugriffe bleiben konsistent','Fertige Klassen in .NET vorhanden'],
        en:['Parallel readers = high throughput','Writes stay consistent','Ready-made classes in .NET']},
  cons:{de:['Writer-Starvation möglich','Komplexer als ein einfaches Lock','Python: GIL relativiert den Gewinn teils'],
        en:['Writer starvation possible','More complex than a plain lock','Python: the GIL partly reduces the gain']},
  related:['thread-pool','singleton','double-checked-locking'],
  csharp:
`public class SettingsCache
{
    private readonly ReaderWriterLockSlim _lock = new();
    private readonly Dictionary<string, string> _data = new();

    public string? Get(string key)
    {
        _lock.EnterReadLock();          // viele parallel OK
        try
        {
            return _data.TryGetValue(key, out var v) ? v : null;
        }
        finally { _lock.ExitReadLock(); }
    }

    public void Set(string key, string value)
    {
        _lock.EnterWriteLock();         // exklusiv!
        try { _data[key] = value; }
        finally { _lock.ExitWriteLock(); }
    }
}

var cache = new SettingsCache();
cache.Set("theme", "dark");
// 100 Threads können jetzt GLEICHZEITIG lesen:
Parallel.For(0, 100, _ => cache.Get("theme"));
Console.WriteLine("Fertig – ohne Lese-Stau.");`,
  python:
`import threading

class ReadWriteLock:
    """Einfacher RW-Lock (Leser bevorzugt)."""
    def __init__(self):
        self._readers = 0
        self._read_lock = threading.Lock()
        self._write_lock = threading.Lock()

    def acquire_read(self):
        with self._read_lock:
            self._readers += 1
            if self._readers == 1:       # erster Leser
                self._write_lock.acquire()  # sperrt Schreiber

    def release_read(self):
        with self._read_lock:
            self._readers -= 1
            if self._readers == 0:       # letzter Leser
                self._write_lock.release()

    def acquire_write(self): self._write_lock.acquire()
    def release_write(self): self._write_lock.release()

rw = ReadWriteLock()
cache = {"theme": "dark"}

def read():
    rw.acquire_read()
    try: return cache.get("theme")   # parallel möglich
    finally: rw.release_read()

print(read())`
},
{
  id:'double-checked-locking', name:'Double-Checked Locking', cat:'concurrency', gof:false, icon:'🔁',
  short:{de:'Prüft eine Bedingung zweimal – vor und nach dem Lock – um teures Sperren zu vermeiden.',
         en:'Checks a condition twice – before and after the lock – to avoid expensive locking.'},
  intent:{de:'Beim thread-sicheren Lazy-Singleton wäre es verschwenderisch, für jeden Zugriff zu locken. Double-Checked Locking prüft erst ohne Lock (schneller Pfad), lockt nur im seltenen Erzeugungsfall und prüft danach erneut. Achtung: korrekt nur mit Memory-Barrier (volatile in C#); in der Praxis nimmt man besser Lazy&lt;T&gt; bzw. Modul-Import in Python.',
          en:'For a thread-safe lazy singleton, locking on every access would be wasteful. Double-checked locking first checks without a lock (fast path), locks only in the rare creation case and checks again afterwards. Caution: only correct with a memory barrier (volatile in C#); in practice prefer Lazy<T> or module import in Python.'},
  analogy:{de:'Der Blick durchs Schaufenster: Ist der Laden offensichtlich leer, gehst du gar nicht erst hinein (kein Lock). Nur wenn etwas da sein könnte, betrittst du den Laden und schaust genau nach.',
           en:'Glancing through a shop window: if the shop is obviously empty you never enter (no lock). Only if something might be there do you enter and check thoroughly.'},
  use:{de:['Lazy-Initialisierung unter hoher Thread-Last','Hot-Paths, wo Locks messbar bremsen','Historisch: Singleton-Implementierungen'],
       en:['Lazy initialization under high thread load','Hot paths where locks measurably slow things down','Historically: singleton implementations']},
  pros:{de:['Schneller Pfad ohne Lock-Kosten','Thread-sicher bei korrekter Umsetzung','Lehrreich für Memory-Modelle'],
        en:['Fast path without lock costs','Thread-safe when implemented correctly','Instructive about memory models']},
  cons:{de:['Extrem leicht falsch zu implementieren','volatile/Memory-Barrier zwingend nötig','Moderne Alternativen sind fast immer besser'],
        en:['Extremely easy to implement incorrectly','volatile/memory barrier strictly required','Modern alternatives are almost always better']},
  related:['singleton','lazy-initialization','read-write-lock'],
  csharp:
`public sealed class Database
{
    // volatile ist hier ESSENZIELL (Memory Barrier):
    private static volatile Database? _instance;
    private static readonly object _gate = new();

    public static Database Instance
    {
        get
        {
            if (_instance == null)            // Check 1: ohne Lock
            {
                lock (_gate)
                {
                    if (_instance == null)    // Check 2: mit Lock
                        _instance = new Database();
                }
            }
            return _instance;
        }
    }
    private Database()
        => Console.WriteLine("DB-Verbindung aufgebaut");
}

// Praxis-Tipp: Lazy<T> erledigt all das korrekt und lesbar:
// private static readonly Lazy<Database> _db = new(() => new());`,
  python:
`import threading

class Database:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:            # Check 1: ohne Lock
            with cls._lock:
                if cls._instance is None:    # Check 2: mit Lock
                    print("DB-Verbindung aufgebaut")
                    cls._instance = super().__new__(cls)
        return cls._instance

# 10 Threads gleichzeitig – Konstruktor läuft genau 1×:
threads = [threading.Thread(target=Database) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()

# Pythonischer: Modul-Level-Instanz –
# Imports sind durch den Import-Lock bereits thread-sicher.`
}
);
</script>
