<script>
/* ================= VERHALTENSMUSTER / BEHAVIORAL ================= */
PATTERNS.push(
{
  id:'chain-of-responsibility', name:'Chain of Responsibility', cat:'behavioral', gof:true, icon:'⛓',
  short:{de:'Reicht eine Anfrage durch eine Kette von Handlern, bis einer sie bearbeitet.',
         en:'Passes a request along a chain of handlers until one processes it.'},
  intent:{de:'Sender und Empfänger werden entkoppelt: Jeder Handler entscheidet selbst, ob er die Anfrage bearbeitet oder an den nächsten weiterreicht. Die Kette lässt sich zur Laufzeit zusammenstellen. Genau so funktionieren Middleware-Pipelines in ASP.NET Core oder Django.',
          en:'Sender and receiver are decoupled: each handler decides whether to process the request or pass it to the next. The chain can be assembled at runtime. This is exactly how middleware pipelines in ASP.NET Core or Django work.'},
  analogy:{de:'Der Support-Eskalationsweg: Erst versucht es der Chatbot, dann der First-Level-Support, dann die Technik – jede Stufe löst das Problem oder reicht es weiter.',
           en:'The support escalation path: first the chatbot tries, then first-level support, then engineering – each stage solves the problem or passes it on.'},
  use:{de:['Mehrere mögliche Bearbeiter, erst zur Laufzeit klar welcher','Middleware/Filter-Pipelines (Auth → Logging → Validierung)','Eskalationslogik und Genehmigungsstufen'],
       en:['Multiple potential handlers, decided at runtime','Middleware/filter pipelines (auth → logging → validation)','Escalation logic and approval levels']},
  pros:{de:['Sender kennt den Bearbeiter nicht','Reihenfolge flexibel konfigurierbar','Single Responsibility pro Handler'],
        en:['Sender does not know the handler','Order flexibly configurable','Single responsibility per handler']},
  cons:{de:['Anfrage kann unbearbeitet enden','Debugging langer Ketten mühsam','Laufzeit-Overhead pro Kettenglied'],
        en:['Request may end unhandled','Debugging long chains is tedious','Runtime overhead per link']},
  related:['command','decorator','mediator'],
  csharp:
`public abstract class SupportHandler
{
    private SupportHandler? _next;
    public SupportHandler SetNext(SupportHandler next)
    { _next = next; return next; }

    public virtual void Handle(string issue, int severity)
    {
        if (_next != null) _next.Handle(issue, severity);
        else Console.WriteLine($"Unbearbeitet: {issue}");
    }
}

public class ChatBot : SupportHandler
{
    public override void Handle(string issue, int severity)
    {
        if (severity <= 1) Console.WriteLine($"Bot löst: {issue}");
        else base.Handle(issue, severity);   // weiterreichen
    }
}
public class FirstLevel : SupportHandler
{
    public override void Handle(string issue, int severity)
    {
        if (severity <= 2) Console.WriteLine($"Support löst: {issue}");
        else base.Handle(issue, severity);
    }
}
public class Engineering : SupportHandler
{
    public override void Handle(string issue, int severity)
        => Console.WriteLine($"Technik löst: {issue}");
}

var chain = new ChatBot();
chain.SetNext(new FirstLevel()).SetNext(new Engineering());

chain.Handle("Passwort vergessen", 1);   // Bot
chain.Handle("Rechnung falsch", 2);      // Support
chain.Handle("Server brennt", 3);        // Technik`,
  python:
`class SupportHandler:
    def __init__(self):
        self._next = None

    def set_next(self, handler):
        self._next = handler
        return handler                 # erlaubt Verkettung

    def handle(self, issue, severity):
        if self._next:
            self._next.handle(issue, severity)
        else:
            print(f"Unbearbeitet: {issue}")

class ChatBot(SupportHandler):
    def handle(self, issue, severity):
        if severity <= 1: print(f"Bot löst: {issue}")
        else: super().handle(issue, severity)

class FirstLevel(SupportHandler):
    def handle(self, issue, severity):
        if severity <= 2: print(f"Support löst: {issue}")
        else: super().handle(issue, severity)

class Engineering(SupportHandler):
    def handle(self, issue, severity):
        print(f"Technik löst: {issue}")

chain = ChatBot()
chain.set_next(FirstLevel()).set_next(Engineering())

chain.handle("Passwort vergessen", 1)   # Bot
chain.handle("Server brennt", 3)        # Technik`
},
{
  id:'command', name:'Command', cat:'behavioral', gof:true, icon:'🎮',
  short:{de:'Verpackt eine Aktion als Objekt – damit sie gespeichert, verzögert und rückgängig gemacht werden kann.',
         en:'Wraps an action as an object – so it can be stored, delayed and undone.'},
  intent:{de:'Command kapselt eine Anfrage samt aller Parameter in einem eigenständigen Objekt. Dadurch werden Aktionen zu Daten: Sie lassen sich in Warteschlangen legen, protokollieren, über das Netzwerk schicken – und mit einer Undo-Methode rückgängig machen. Grundlage jedes „Rückgängig/Wiederholen" in Editoren.',
          en:'Command encapsulates a request including all parameters in a standalone object. Actions become data: they can be queued, logged, sent over the network – and reversed with an undo method. The foundation of every "undo/redo" in editors.'},
  analogy:{de:'Der Bestellzettel im Restaurant: Der Kellner schreibt den Wunsch auf, hängt ihn in die Küche – wer kocht und wann, ist vom Gast entkoppelt. Und der Zettel lässt sich stornieren.',
           en:'The order slip in a restaurant: the waiter writes down the wish and hangs it in the kitchen – who cooks and when is decoupled from the guest. And the slip can be cancelled.'},
  use:{de:['Undo/Redo-Funktionalität','Aktionen in Warteschlangen, Makros, Scheduler','UI-Buttons/Shortcuts von Logik entkoppeln'],
       en:['Undo/redo functionality','Actions in queues, macros, schedulers','Decoupling UI buttons/shortcuts from logic']},
  pros:{de:['Undo/Redo elegant möglich','Aktionen speicher- und übertragbar','Neue Kommandos ohne Änderung des Aufrufers'],
        en:['Undo/redo elegantly possible','Actions storable and transferable','New commands without changing the invoker']},
  cons:{de:['Eine Klasse pro Aktion → viel Code','Undo-Zustand korrekt zu halten ist knifflig','Indirektion erschwert Nachvollziehbarkeit'],
        en:['One class per action → lots of code','Keeping undo state correct is tricky','Indirection reduces traceability']},
  related:['memento','strategy','chain-of-responsibility'],
  csharp:
`public interface ICommand { void Execute(); void Undo(); }

public class BankAccount
{
    public decimal Balance { get; private set; }
    public void Deposit(decimal a)  { Balance += a; }
    public void Withdraw(decimal a) { Balance -= a; }
}

public class DepositCommand(BankAccount acc, decimal amount)
    : ICommand
{
    public void Execute() => acc.Deposit(amount);
    public void Undo()    => acc.Withdraw(amount);
}

// Invoker mit Undo-Historie:
public class TransactionManager
{
    private readonly Stack<ICommand> _history = new();
    public void Run(ICommand cmd)
    { cmd.Execute(); _history.Push(cmd); }
    public void UndoLast()
    { if (_history.Count > 0) _history.Pop().Undo(); }
}

var account = new BankAccount();
var manager = new TransactionManager();
manager.Run(new DepositCommand(account, 100));
manager.Run(new DepositCommand(account, 50));
Console.WriteLine(account.Balance);   // 150
manager.UndoLast();
Console.WriteLine(account.Balance);   // 100`,
  python:
`from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self): ...
    @abstractmethod
    def undo(self): ...

class BankAccount:
    def __init__(self): self.balance = 0

class DepositCommand(Command):
    def __init__(self, account, amount):
        self.account, self.amount = account, amount
    def execute(self): self.account.balance += self.amount
    def undo(self):    self.account.balance -= self.amount

class TransactionManager:            # Invoker mit Historie
    def __init__(self): self._history = []
    def run(self, cmd: Command):
        cmd.execute()
        self._history.append(cmd)
    def undo_last(self):
        if self._history:
            self._history.pop().undo()

account = BankAccount()
mgr = TransactionManager()
mgr.run(DepositCommand(account, 100))
mgr.run(DepositCommand(account, 50))
print(account.balance)   # 150
mgr.undo_last()
print(account.balance)   # 100`
},
{
  id:'interpreter', name:'Interpreter', cat:'behavioral', gof:true, icon:'📖',
  short:{de:'Definiert eine Grammatik für eine kleine Sprache und wertet Sätze dieser Sprache aus.',
         en:'Defines a grammar for a small language and evaluates sentences of that language.'},
  intent:{de:'Für wiederkehrende Probleme einer Domäne lohnt sich manchmal eine Mini-Sprache (DSL): Filterausdrücke, Formeln, Regelwerke. Interpreter bildet jede Grammatikregel als Klasse ab; Ausdrücke werden zu einem Baum (AST) zusammengesetzt und rekursiv ausgewertet. Für komplexe Sprachen greift man besser zu Parser-Generatoren.',
          en:'For recurring problems in a domain, a mini language (DSL) is sometimes worthwhile: filter expressions, formulas, rule sets. Interpreter maps each grammar rule to a class; expressions are composed into a tree (AST) and evaluated recursively. For complex languages, parser generators are the better choice.'},
  analogy:{de:'Ein Musiker liest Noten: Die Notenschrift ist eine Grammatik, und der Musiker „interpretiert" jedes Symbol nach festen Regeln zu Klang.',
           en:'A musician reading sheet music: notation is a grammar, and the musician "interprets" each symbol into sound according to fixed rules.'},
  use:{de:['Eigene kleine Abfrage-/Regelsprachen (Filter, Preisregeln)','Mathematische Ausdrücke auswerten','Konfigurierbare Business-Regeln'],
       en:['Small custom query/rule languages (filters, pricing rules)','Evaluating mathematical expressions','Configurable business rules']},
  pros:{de:['Grammatik klar im Code abgebildet','Leicht um neue Regeln erweiterbar','Fachanwender können Ausdrücke schreiben'],
        en:['Grammar clearly mapped in code','Easily extended with new rules','Domain experts can write expressions']},
  cons:{de:['Skaliert schlecht für komplexe Grammatiken','Eine Klasse pro Regel → Klassenflut','Performance bei tiefen Bäumen'],
        en:['Scales poorly for complex grammars','One class per rule → class flood','Performance with deep trees']},
  related:['composite','visitor','flyweight'],
  csharp:
`// Grammatik: Expr = Zahl | Expr '+' Expr | Expr '-' Expr
public interface IExpression { int Interpret(); }

public class NumberExpr(int value) : IExpression
{
    public int Interpret() => value;
}
public class AddExpr(IExpression l, IExpression r) : IExpression
{
    public int Interpret() => l.Interpret() + r.Interpret();
}
public class SubExpr(IExpression l, IExpression r) : IExpression
{
    public int Interpret() => l.Interpret() - r.Interpret();
}

// AST für: (10 + 5) - 3
IExpression expr =
    new SubExpr(
        new AddExpr(new NumberExpr(10), new NumberExpr(5)),
        new NumberExpr(3));

Console.WriteLine(expr.Interpret());   // 12`,
  python:
`from abc import ABC, abstractmethod

class Expression(ABC):
    @abstractmethod
    def interpret(self) -> int: ...

class Number(Expression):
    def __init__(self, value): self.value = value
    def interpret(self): return self.value

class Add(Expression):
    def __init__(self, left, right):
        self.left, self.right = left, right
    def interpret(self):
        return self.left.interpret() + self.right.interpret()

class Sub(Expression):
    def __init__(self, left, right):
        self.left, self.right = left, right
    def interpret(self):
        return self.left.interpret() - self.right.interpret()

# AST für: (10 + 5) - 3
expr = Sub(Add(Number(10), Number(5)), Number(3))
print(expr.interpret())   # 12`
},
{
  id:'iterator', name:'Iterator', cat:'behavioral', gof:true, icon:'🚶',
  short:{de:'Durchläuft eine Sammlung Element für Element, ohne ihre interne Struktur offenzulegen.',
         en:'Traverses a collection element by element without exposing its internal structure.'},
  intent:{de:'Der Iterator kapselt das „Wie" des Durchlaufens: Der Client sagt nur „nächstes Element", egal ob dahinter ein Array, Baum oder eine Datenbank steckt. Beide Sprachen haben das Muster fest eingebaut: foreach/IEnumerable in C#, for-in/Generatoren in Python – man implementiert es meist deklarativ mit yield.',
          en:'The iterator encapsulates the "how" of traversal: the client just says "next element", regardless of whether an array, tree or database is behind it. Both languages have the pattern built in: foreach/IEnumerable in C#, for-in/generators in Python – usually implemented declaratively with yield.'},
  analogy:{de:'Ein Museums-Audioguide: Er führt dich Werk für Werk durch die Ausstellung – du musst den Gebäudeplan nicht kennen.',
           en:'A museum audio guide: it leads you piece by piece through the exhibition – you never need to know the floor plan.'},
  use:{de:['Einheitliches Durchlaufen verschiedener Datenstrukturen','Lazy-Sequenzen: Elemente entstehen erst beim Zugriff','Mehrere gleichzeitige Durchläufe derselben Sammlung'],
       en:['Uniform traversal of different data structures','Lazy sequences: elements created on access','Multiple simultaneous traversals of the same collection']},
  pros:{de:['Interna der Sammlung bleiben verborgen','Lazy Evaluation spart Speicher','Sprachunterstützung: yield macht es trivial'],
        en:['Collection internals stay hidden','Lazy evaluation saves memory','Language support: yield makes it trivial']},
  cons:{de:['Für simple Listen Overhead','Änderung während Iteration problematisch','Zustandsbehaftete Iteratoren schwer parallelisierbar'],
        en:['Overhead for simple lists','Modification during iteration is problematic','Stateful iterators hard to parallelize']},
  related:['composite','visitor','memento'],
  csharp:
`public class Playlist : IEnumerable<string>
{
    private readonly List<string> _songs = new();
    public void Add(string song) => _songs.Add(song);

    // Eigener Iterator mit yield – lazy & simpel:
    public IEnumerator<string> GetEnumerator()
    {
        foreach (var song in _songs)
        {
            Console.WriteLine("(lade nächsten Song ...)");
            yield return song;      // pausiert hier!
        }
    }
    System.Collections.IEnumerator
        System.Collections.IEnumerable.GetEnumerator()
        => GetEnumerator();
}

var list = new Playlist();
list.Add("Song A"); list.Add("Song B");

foreach (var s in list)        // nutzt unseren Iterator
    Console.WriteLine($"▶ {s}");

// Unendliche Lazy-Sequenz:
static IEnumerable<int> Numbers()
{ int i = 0; while (true) yield return i++; }
Console.WriteLine(Numbers().Take(3).Sum());   // 0+1+2 = 3`,
  python:
`class Playlist:
    def __init__(self):
        self._songs = []

    def add(self, song):
        self._songs.append(song)

    def __iter__(self):              # Generator = Iterator
        for song in self._songs:
            print("(lade nächsten Song ...)")
            yield song               # pausiert hier!

playlist = Playlist()
playlist.add("Song A")
playlist.add("Song B")

for s in playlist:                   # nutzt unseren Iterator
    print(f"▶ {s}")

# Unendliche Lazy-Sequenz:
def numbers():
    i = 0
    while True:
        yield i
        i += 1

import itertools
print(sum(itertools.islice(numbers(), 3)))   # 0+1+2 = 3`
},
{
  id:'mediator', name:'Mediator', cat:'behavioral', gof:true, icon:'🗼',
  short:{de:'Ein Vermittler bündelt die Kommunikation vieler Objekte – statt dass alle mit allen reden.',
         en:'A mediator centralizes communication of many objects – instead of everyone talking to everyone.'},
  intent:{de:'Bei n Objekten, die sich direkt kennen, entstehen bis zu n·(n−1)/2 Verbindungen. Der Mediator ersetzt dieses Geflecht: Alle Komponenten reden nur mit ihm, er koordiniert. Bekannt aus UI-Dialogen (Feld A steuert Sichtbarkeit von Feld B) und in .NET durch die MediatR-Bibliothek.',
          en:'With n objects knowing each other directly, up to n·(n−1)/2 connections emerge. The mediator replaces this mesh: all components talk only to it, it coordinates. Known from UI dialogs (field A controls visibility of field B) and in .NET via the MediatR library.'},
  analogy:{de:'Der Tower am Flughafen: Piloten sprechen nie direkt miteinander – der Tower koordiniert Starts und Landungen zentral.',
           en:'The airport control tower: pilots never talk directly to each other – the tower coordinates take-offs and landings centrally.'},
  use:{de:['Viele Komponenten mit komplexen Wechselwirkungen (UI-Formulare)','Chat-Räume, Event-Koordination','Kommunikationslogik zentral testbar machen'],
       en:['Many components with complex interactions (UI forms)','Chat rooms, event coordination','Making communication logic centrally testable']},
  pros:{de:['Komponenten kennen sich nicht mehr','Kommunikationslogik an einem Ort','Komponenten einzeln wiederverwendbar'],
        en:['Components no longer know each other','Communication logic in one place','Components individually reusable']},
  cons:{de:['Mediator kann zum Gott-Objekt werden','Zusätzliche Indirektion','Single Point of Failure'],
        en:['Mediator can become a god object','Additional indirection','Single point of failure']},
  related:['observer','facade','command'],
  csharp:
`public interface IChatRoom
{
    void Broadcast(string from, string msg);
}

public class User(string name, IChatRoom room)
{
    public string Name => name;
    public void Send(string msg) => room.Broadcast(name, msg);
    public void Receive(string from, string msg)
        => Console.WriteLine($"[{name}] {from}: {msg}");
}

// Der Mediator – kennt alle, koordiniert alles:
public class ChatRoom : IChatRoom
{
    private readonly List<User> _users = new();
    public User Join(string name)
    {
        var u = new User(name, this);
        _users.Add(u);
        return u;
    }
    public void Broadcast(string from, string msg)
    {
        foreach (var u in _users.Where(u => u.Name != from))
            u.Receive(from, msg);
    }
}

var room = new ChatRoom();
var anna = room.Join("Anna");
room.Join("Ben"); room.Join("Cara");
anna.Send("Hallo zusammen!");   // Ben & Cara empfangen`,
  python:
`class ChatRoom:                     # der Mediator
    def __init__(self):
        self._users = []

    def join(self, name):
        user = User(name, self)
        self._users.append(user)
        return user

    def broadcast(self, sender, msg):
        for user in self._users:
            if user.name != sender:
                user.receive(sender, msg)

class User:
    def __init__(self, name, room: ChatRoom):
        self.name, self._room = name, room

    def send(self, msg):
        self._room.broadcast(self.name, msg)   # nur via Mediator

    def receive(self, sender, msg):
        print(f"[{self.name}] {sender}: {msg}")

room = ChatRoom()
anna = room.join("Anna")
room.join("Ben"); room.join("Cara")
anna.send("Hallo zusammen!")   # Ben & Cara empfangen`
},
{
  id:'memento', name:'Memento', cat:'behavioral', gof:true, icon:'💾',
  short:{de:'Speichert Schnappschüsse des Objektzustands – für Undo, ohne Interna preiszugeben.',
         en:'Stores snapshots of object state – for undo, without exposing internals.'},
  intent:{de:'Memento erlaubt es, den Zustand eines Objekts zu sichern und wiederherzustellen, ohne dessen Kapselung zu verletzen. Drei Rollen: der Originator (erzeugt Schnappschüsse seines Zustands), das Memento (unveränderlicher Schnappschuss) und der Caretaker (verwaltet die Historie, ohne hineinzuschauen).',
          en:'Memento allows saving and restoring an object’s state without violating its encapsulation. Three roles: the originator (creates snapshots of its state), the memento (immutable snapshot) and the caretaker (manages history without looking inside).'},
  analogy:{de:'Spielstände in Videospielen: Vor dem Bosskampf speichern – geht es schief, lädst du den Schnappschuss. Das Spiel verrät dir nicht, was intern in der Datei steckt.',
           en:'Save games: save before the boss fight – if it goes wrong, you load the snapshot. The game never tells you what is inside the file.'},
  use:{de:['Undo/Rollback von Objektzuständen','Snapshots vor riskanten Operationen (Transaktionen)','Editor-Historie in Kombination mit Command'],
       en:['Undo/rollback of object states','Snapshots before risky operations (transactions)','Editor history combined with Command']},
  pros:{de:['Kapselung bleibt gewahrt','Einfaches Zustands-Rollback','Historie beliebig tief'],
        en:['Encapsulation preserved','Simple state rollback','History arbitrarily deep']},
  cons:{de:['Speicherverbrauch bei großen Zuständen','Caretaker muss Lebenszyklus verwalten','Deep-Copy-Kosten'],
        en:['Memory usage with large states','Caretaker must manage lifecycle','Deep copy costs']},
  related:['command','prototype','iterator'],
  csharp:
`public class Editor
{
    public string Text { get; private set; } = "";
    public void Type(string words) => Text += words;

    // Originator erzeugt/liest Mementos:
    public record Memento(string State);
    public Memento Save() => new(Text);
    public void Restore(Memento m) => Text = m.State;
}

// Caretaker verwaltet die Historie – ohne Inhalt zu kennen:
public class History
{
    private readonly Stack<Editor.Memento> _stack = new();
    public void Backup(Editor e) => _stack.Push(e.Save());
    public void Undo(Editor e)
    { if (_stack.Count > 0) e.Restore(_stack.Pop()); }
}

var editor = new Editor();
var history = new History();

editor.Type("Hallo ");
history.Backup(editor);       // Schnappschuss
editor.Type("Welt – ups, Tippfehler!");
history.Undo(editor);         // zurück zum Schnappschuss
Console.WriteLine(editor.Text);   // "Hallo "`,
  python:
`from dataclasses import dataclass

@dataclass(frozen=True)
class Memento:                 # unveränderlicher Schnappschuss
    state: str

class Editor:                  # Originator
    def __init__(self): self.text = ""
    def type(self, words): self.text += words
    def save(self) -> Memento: return Memento(self.text)
    def restore(self, m: Memento): self.text = m.state

class History:                 # Caretaker
    def __init__(self): self._stack = []
    def backup(self, editor): self._stack.append(editor.save())
    def undo(self, editor):
        if self._stack:
            editor.restore(self._stack.pop())

editor, history = Editor(), History()
editor.type("Hallo ")
history.backup(editor)             # Schnappschuss
editor.type("Welt – ups, Tippfehler!")
history.undo(editor)               # zurück zum Schnappschuss
print(editor.text)                 # "Hallo "`
},
{
  id:'observer', name:'Observer', cat:'behavioral', gof:true, icon:'👁',
  short:{de:'Objekte abonnieren Ereignisse und werden automatisch benachrichtigt, wenn sich etwas ändert.',
         en:'Objects subscribe to events and are notified automatically when something changes.'},
  intent:{de:'Observer definiert eine 1:n-Abhängigkeit: Ändert das Subjekt seinen Zustand, werden alle registrierten Beobachter benachrichtigt – ohne dass das Subjekt ihre konkreten Klassen kennt. Das Muster ist das Herz von Event-Systemen: C#-events, GUI-Frameworks, Rx, MQTT. Es ist die Basis fast jeder reaktiven Architektur.',
          en:'Observer defines a 1:n dependency: when the subject changes state, all registered observers are notified – without the subject knowing their concrete classes. The pattern is the heart of event systems: C# events, GUI frameworks, Rx, MQTT. It underpins almost every reactive architecture.'},
  analogy:{de:'Ein YouTube-Kanal: Abonnenten bekommen automatisch eine Benachrichtigung bei jedem neuen Video – der Kanal kennt seine Abonnenten nicht persönlich.',
           en:'A YouTube channel: subscribers automatically get notified about every new video – the channel does not know its subscribers personally.'},
  use:{de:['GUI-Events: Klick, Eingabe, Statusänderung','Modelländerungen an mehrere Ansichten melden (MVC!)','Lose gekoppelte Ereignis-Kommunikation'],
       en:['GUI events: click, input, state change','Reporting model changes to multiple views (MVC!)','Loosely coupled event communication']},
  pros:{de:['Lose Kopplung Subjekt ↔ Beobachter','Abonnenten zur Laufzeit an-/abmeldbar','Broadcast an beliebig viele Empfänger'],
        en:['Loose coupling subject ↔ observer','Subscribers can join/leave at runtime','Broadcast to any number of receivers']},
  cons:{de:['Benachrichtigungsreihenfolge undefiniert','Memory Leaks bei vergessener Abmeldung','Kaskaden von Updates schwer nachvollziehbar'],
        en:['Notification order undefined','Memory leaks if unsubscribe is forgotten','Update cascades hard to trace']},
  related:['mediator','publish-subscribe','event-sourcing'],
  demo:'observer',
  csharp:
`// In C# idiomatisch mit event/EventHandler:
public class WeatherStation
{
    public event EventHandler<float>? TemperatureChanged;

    private float _temp;
    public float Temperature
    {
        get => _temp;
        set { _temp = value; TemperatureChanged?.Invoke(this, value); }
    }
}

var station = new WeatherStation();

// Beliebig viele Abonnenten:
station.TemperatureChanged += (_, t) =>
    Console.WriteLine($"Display: {t}°C");
station.TemperatureChanged += (_, t) =>
{
    if (t > 30) Console.WriteLine("Warnung: Hitze!");
};

station.Temperature = 25;   // Display: 25°C
station.Temperature = 32;   // Display: 32°C + Warnung: Hitze!`,
  python:
`class WeatherStation:                   # Subjekt
    def __init__(self):
        self._observers = []
        self._temp = 0.0

    def subscribe(self, callback):
        self._observers.append(callback)

    def unsubscribe(self, callback):
        self._observers.remove(callback)

    @property
    def temperature(self): return self._temp

    @temperature.setter
    def temperature(self, value):
        self._temp = value
        for notify in self._observers:   # alle benachrichtigen
            notify(value)

station = WeatherStation()
station.subscribe(lambda t: print(f"Display: {t}°C"))
station.subscribe(lambda t: t > 30 and print("Warnung: Hitze!"))

station.temperature = 25    # Display: 25°C
station.temperature = 32    # Display: 32°C + Warnung: Hitze!`
},
{
  id:'state', name:'State', cat:'behavioral', gof:true, icon:'🚦',
  short:{de:'Ein Objekt ändert sein Verhalten, wenn sich sein innerer Zustand ändert – ohne if-Kaskaden.',
         en:'An object changes its behavior when its internal state changes – without if cascades.'},
  intent:{de:'Statt riesiger switch/if-Blöcke („wenn Status == X dann …") bekommt jeder Zustand eine eigene Klasse mit dem passenden Verhalten. Das Kontextobjekt delegiert an sein aktuelles Zustandsobjekt und wechselt es bei Übergängen aus. Ideal für Zustandsautomaten: Bestellstatus, Player, Verbindungen, Workflows.',
          en:'Instead of huge switch/if blocks ("if status == X then …"), each state gets its own class with the matching behavior. The context object delegates to its current state object and swaps it on transitions. Ideal for state machines: order status, players, connections, workflows.'},
  analogy:{de:'Dein Smartphone: Im Lautlos-Modus reagiert es auf einen Anruf anders als im Normal- oder Nicht-stören-Modus – gleiche Taste, anderes Verhalten je Zustand.',
           en:'Your smartphone: in silent mode it reacts to a call differently than in normal or do-not-disturb mode – same button, different behavior per state.'},
  use:{de:['Zustandsautomaten: Bestellungen, Dokumente, Verbindungen','Verhalten hängt massiv vom Status ab','if/switch-Kaskaden über Statusfelder ersetzen'],
       en:['State machines: orders, documents, connections','Behavior depends heavily on status','Replacing if/switch cascades over status fields']},
  pros:{de:['Zustandslogik sauber getrennt','Neue Zustände ohne Änderung der anderen','Übergänge explizit und nachvollziehbar'],
        en:['State logic cleanly separated','New states without changing others','Transitions explicit and traceable']},
  cons:{de:['Viele Klassen bei vielen Zuständen','Übergangsübersicht verteilt sich','Für 2–3 Zustände oft Overkill'],
        en:['Many classes with many states','Transition overview gets scattered','Often overkill for 2–3 states']},
  related:['strategy','memento','singleton'],
  demo:'state',
  csharp:
`public abstract class OrderState
{
    public abstract string Name { get; }
    public abstract OrderState Next();
}
public class Placed : OrderState
{
    public override string Name => "Bestellt";
    public override OrderState Next() => new Shipped();
}
public class Shipped : OrderState
{
    public override string Name => "Versandt";
    public override OrderState Next() => new Delivered();
}
public class Delivered : OrderState
{
    public override string Name => "Zugestellt";
    public override OrderState Next() => this;   // Endzustand
}

public class Order
{
    private OrderState _state = new Placed();
    public string Status => _state.Name;
    public void Advance() => _state = _state.Next();
}

var order = new Order();
Console.WriteLine(order.Status);   // Bestellt
order.Advance();
Console.WriteLine(order.Status);   // Versandt
order.Advance();
Console.WriteLine(order.Status);   // Zugestellt`,
  python:
`from abc import ABC, abstractmethod

class OrderState(ABC):
    name = "?"
    @abstractmethod
    def next(self) -> "OrderState": ...

class Placed(OrderState):
    name = "Bestellt"
    def next(self): return Shipped()

class Shipped(OrderState):
    name = "Versandt"
    def next(self): return Delivered()

class Delivered(OrderState):
    name = "Zugestellt"
    def next(self): return self      # Endzustand

class Order:
    def __init__(self): self._state = Placed()
    @property
    def status(self): return self._state.name
    def advance(self): self._state = self._state.next()

order = Order()
print(order.status)    # Bestellt
order.advance()
print(order.status)    # Versandt
order.advance()
print(order.status)    # Zugestellt`
},
{
  id:'strategy', name:'Strategy', cat:'behavioral', gof:true, icon:'🎯',
  short:{de:'Kapselt austauschbare Algorithmen hinter einer Schnittstelle – wählbar zur Laufzeit.',
         en:'Encapsulates interchangeable algorithms behind an interface – selectable at runtime.'},
  intent:{de:'Strategy definiert eine Familie von Algorithmen (z. B. Versandkosten-Berechnungen, Sortierungen, Zahlarten) und macht sie gegeneinander austauschbar. Der Kontext kennt nur die Schnittstelle. In modernen Sprachen übernehmen oft Lambdas/Delegates die Rolle der Strategieklassen – die Idee bleibt identisch.',
          en:'Strategy defines a family of algorithms (e.g. shipping cost calculations, sorting, payment methods) and makes them interchangeable. The context only knows the interface. In modern languages lambdas/delegates often play the role of strategy classes – the idea stays identical.'},
  analogy:{de:'Navigation zur Arbeit: Auto, Fahrrad oder Bahn – das Ziel ist gleich, der Algorithmus (die Route) ist austauschbar, und du entscheidest situativ.',
           en:'Commuting to work: car, bike or train – the goal is the same, the algorithm (route) is interchangeable, and you decide situationally.'},
  use:{de:['Mehrere Varianten desselben Algorithmus','Verhalten zur Laufzeit wechseln (Preis-, Rabattlogik)','if/else über „Modus"-Variablen ersetzen'],
       en:['Multiple variants of the same algorithm','Switching behavior at runtime (pricing, discount logic)','Replacing if/else over "mode" variables']},
  pros:{de:['Algorithmen isoliert und einzeln testbar','Open-Closed: neue Strategie = neue Klasse','Laufzeit-Austausch möglich'],
        en:['Algorithms isolated and individually testable','Open-closed: new strategy = new class','Runtime swapping possible']},
  cons:{de:['Client muss Strategien kennen und wählen','Mehr Objekte im Umlauf','Bei wenigen, stabilen Varianten unnötig'],
        en:['Client must know and choose strategies','More objects around','Unnecessary with few, stable variants']},
  related:['state','template-method','command','bridge','dependency-injection'],
  demo:'strategy',
  csharp:
`public interface IShippingStrategy
{
    decimal Calculate(decimal orderTotal);
}
public class StandardShipping : IShippingStrategy
{
    public decimal Calculate(decimal t) => t > 50 ? 0 : 4.95m;
}
public class ExpressShipping : IShippingStrategy
{
    public decimal Calculate(decimal t) => 12.90m;
}
public class PickupShipping : IShippingStrategy
{
    public decimal Calculate(decimal t) => 0;
}

public class Checkout(IShippingStrategy strategy)
{
    public void PrintTotal(decimal total)
    {
        var ship = strategy.Calculate(total);
        Console.WriteLine($"Ware {total} € + Versand {ship} €");
    }
}

// Strategie wird zur Laufzeit gewählt:
new Checkout(new StandardShipping()).PrintTotal(39.99m);
new Checkout(new ExpressShipping()).PrintTotal(39.99m);

// Modern: Delegate statt Klasse
Func<decimal, decimal> eco = t => t > 50 ? 0 : 3.50m;`,
  python:
`from typing import Callable

# Klassisch mit Klassen – oder pythonisch mit Funktionen:
def standard_shipping(total: float) -> float:
    return 0 if total > 50 else 4.95

def express_shipping(total: float) -> float:
    return 12.90

def pickup(total: float) -> float:
    return 0

class Checkout:
    def __init__(self, strategy: Callable[[float], float]):
        self._strategy = strategy      # Funktion als Strategie

    def print_total(self, total: float):
        ship = self._strategy(total)
        print(f"Ware {total} € + Versand {ship} €")

# Strategie wird zur Laufzeit gewählt:
Checkout(standard_shipping).print_total(39.99)
Checkout(express_shipping).print_total(39.99)
Checkout(pickup).print_total(39.99)`
},
{
  id:'template-method', name:'Template Method', cat:'behavioral', gof:true, icon:'📋',
  short:{de:'Definiert das Skelett eines Algorithmus – Unterklassen füllen einzelne Schritte aus.',
         en:'Defines the skeleton of an algorithm – subclasses fill in individual steps.'},
  intent:{de:'Die Template Method legt in der Basisklasse die unveränderliche Schrittfolge fest (das „Rezept") und deklariert einzelne Schritte als abstrakt oder überschreibbar (Hooks). Unterklassen passen nur diese Schritte an – die Gesamtstruktur bleibt garantiert erhalten. Hollywood-Prinzip: „Don’t call us, we call you."',
          en:'The template method fixes the invariant sequence of steps (the "recipe") in the base class and declares individual steps as abstract or overridable (hooks). Subclasses only adapt these steps – the overall structure is guaranteed to remain. Hollywood principle: "Don’t call us, we call you."'},
  analogy:{de:'Ein Backrezept: Die Schritte „Teig anrühren → backen → verzieren" stehen fest. Ob Schoko- oder Zitronenkuchen entsteht, entscheiden die konkreten Zutaten in den Einzelschritten.',
           en:'A baking recipe: the steps "mix dough → bake → decorate" are fixed. Whether it becomes chocolate or lemon cake is decided by the concrete ingredients in the individual steps.'},
  use:{de:['Gleicher Ablauf, unterschiedliche Details (Import: CSV/JSON/XML)','Frameworks mit Erweiterungspunkten (Hooks)','Code-Duplikate in ähnlichen Algorithmen beseitigen'],
       en:['Same flow, different details (import: CSV/JSON/XML)','Frameworks with extension points (hooks)','Removing duplication in similar algorithms']},
  pros:{de:['Ablauf zentral garantiert','Duplikate wandern in die Basisklasse','Gezielte Erweiterungspunkte'],
        en:['Flow centrally guaranteed','Duplicates move to the base class','Targeted extension points']},
  cons:{de:['Vererbung statt Komposition (starrer)','Liskov-Verletzungen möglich','Viele Hooks → unübersichtlich'],
        en:['Inheritance instead of composition (more rigid)','Liskov violations possible','Many hooks → confusing']},
  related:['strategy','factory-method'],
  csharp:
`public abstract class DataImporter
{
    // DIE Template Method – Ablauf ist fixiert:
    public void Import(string file)
    {
        var raw = ReadFile(file);
        var records = Parse(raw);        // variiert je Format
        Validate(records);
        Console.WriteLine($"{records.Count} Datensätze importiert");
    }

    private string ReadFile(string f) => $"Inhalt von {f}";
    protected abstract List<string> Parse(string raw);
    protected virtual void Validate(List<string> r)   // Hook
        => Console.WriteLine("Standard-Validierung");
}

public class CsvImporter : DataImporter
{
    protected override List<string> Parse(string raw)
        => raw.Split(',').ToList();
}
public class JsonImporter : DataImporter
{
    protected override List<string> Parse(string raw)
        => new() { "json1", "json2" };
    protected override void Validate(List<string> r)
        => Console.WriteLine("Strenge JSON-Schema-Prüfung");
}

new CsvImporter().Import("daten.csv");
new JsonImporter().Import("daten.json");`,
  python:
`from abc import ABC, abstractmethod

class DataImporter(ABC):
    def import_file(self, file: str):     # Template Method
        raw = self._read(file)
        records = self.parse(raw)         # variiert je Format
        self.validate(records)            # Hook
        print(f"{len(records)} Datensätze importiert")

    def _read(self, f): return f"Inhalt von {f}"

    @abstractmethod
    def parse(self, raw: str) -> list: ...

    def validate(self, records):          # Hook mit Default
        print("Standard-Validierung")

class CsvImporter(DataImporter):
    def parse(self, raw): return raw.split(",")

class JsonImporter(DataImporter):
    def parse(self, raw): return ["json1", "json2"]
    def validate(self, records):
        print("Strenge JSON-Schema-Prüfung")

CsvImporter().import_file("daten.csv")
JsonImporter().import_file("daten.json")`
},
{
  id:'visitor', name:'Visitor', cat:'behavioral', gof:true, icon:'🧳',
  short:{de:'Fügt einer Objektstruktur neue Operationen hinzu, ohne ihre Klassen zu ändern.',
         en:'Adds new operations to an object structure without changing its classes.'},
  intent:{de:'Visitor trennt Algorithmen von der Objektstruktur, auf der sie arbeiten. Jedes Element „akzeptiert" einen Besucher und ruft dessen passende Methode auf (Double Dispatch). Neue Operationen (Export, Statistik, Rendering) kommen als neue Visitor-Klassen dazu – die Elementklassen bleiben unberührt. Klassisch für Compiler-ASTs.',
          en:'Visitor separates algorithms from the object structure they operate on. Each element "accepts" a visitor and calls its matching method (double dispatch). New operations (export, statistics, rendering) are added as new visitor classes – element classes stay untouched. Classic for compiler ASTs.'},
  analogy:{de:'Ein Versicherungsvertreter besucht Gebäude: Beim Wohnhaus verkauft er Hausrat-, beim Büro Gewerbeversicherung – das Gebäude bleibt, der Besucher bringt das Verhalten mit.',
           en:'An insurance agent visits buildings: at a home they sell home insurance, at an office commercial insurance – the building stays the same, the visitor brings the behavior.'},
  use:{de:['Viele verschiedene Operationen auf stabiler Objektstruktur','Compiler/AST-Traversierung, Export in mehrere Formate','Operationen sauber von Datenklassen trennen'],
       en:['Many different operations on a stable object structure','Compiler/AST traversal, export to multiple formats','Cleanly separating operations from data classes']},
  pros:{de:['Neue Operationen ohne Elementänderung','Verwandte Logik in einer Visitor-Klasse gebündelt','Double Dispatch löst Typ-Weichen elegant'],
        en:['New operations without element changes','Related logic bundled in one visitor class','Double dispatch elegantly solves type switches']},
  cons:{de:['Neue Elementtypen erfordern Änderung aller Visitor','Umständlich bei sich ändernder Struktur','Zugriff auf Interna nötig → Kapselung leidet'],
        en:['New element types require changing all visitors','Awkward when the structure changes','Needs access to internals → encapsulation suffers']},
  related:['composite','iterator','interpreter'],
  csharp:
`public interface IShapeVisitor
{
    void Visit(Circle c);
    void Visit(Rectangle r);
}
public interface IShape { void Accept(IShapeVisitor v); }

public class Circle : IShape
{
    public double Radius = 3;
    public void Accept(IShapeVisitor v) => v.Visit(this);
}
public class Rectangle : IShape
{
    public double W = 4, H = 5;
    public void Accept(IShapeVisitor v) => v.Visit(this);
}

// Neue Operation = neue Visitor-Klasse:
public class AreaVisitor : IShapeVisitor
{
    public double Total { get; private set; }
    public void Visit(Circle c) => Total += Math.PI * c.Radius * c.Radius;
    public void Visit(Rectangle r) => Total += r.W * r.H;
}

var shapes = new List<IShape> { new Circle(), new Rectangle() };
var area = new AreaVisitor();
foreach (var s in shapes) s.Accept(area);   // Double Dispatch
Console.WriteLine($"Gesamtfläche: {area.Total:F1}");`,
  python:
`import math

class Circle:
    def __init__(self): self.radius = 3
    def accept(self, visitor): visitor.visit_circle(self)

class Rectangle:
    def __init__(self): self.w, self.h = 4, 5
    def accept(self, visitor): visitor.visit_rectangle(self)

# Neue Operation = neue Visitor-Klasse:
class AreaVisitor:
    def __init__(self): self.total = 0.0
    def visit_circle(self, c):
        self.total += math.pi * c.radius ** 2
    def visit_rectangle(self, r):
        self.total += r.w * r.h

class ExportVisitor:
    def visit_circle(self, c): print(f"<circle r='{c.radius}'/>")
    def visit_rectangle(self, r): print(f"<rect w='{r.w}'/>")

shapes = [Circle(), Rectangle()]
area = AreaVisitor()
for s in shapes:
    s.accept(area)            # Double Dispatch
print(f"Gesamtfläche: {area.total:.1f}")`
},
{
  id:'null-object', name:'Null Object', cat:'behavioral', gof:false, icon:'∅',
  short:{de:'Ersetzt null durch ein neutrales Objekt mit „Nichts-tun"-Verhalten – Schluss mit null-Checks.',
         en:'Replaces null with a neutral object with "do nothing" behavior – no more null checks.'},
  intent:{de:'Statt überall if (x != null) zu prüfen, liefert man ein Null Object zurück: Es implementiert dieselbe Schnittstelle, tut aber schlicht nichts (oder das neutral Richtige). Der Client-Code behandelt den Sonderfall „nicht vorhanden" damit völlig transparent. Beliebt für Logger, optionale Rabatte oder Gast-Benutzer.',
          en:'Instead of checking if (x != null) everywhere, you return a null object: it implements the same interface but simply does nothing (or the neutral right thing). Client code thus handles the "absent" case completely transparently. Popular for loggers, optional discounts or guest users.'},
  analogy:{de:'Ein Anrufbeantworter: Ist niemand zu Hause, geht trotzdem „jemand" ran – der Anrufer muss keinen Sonderfall behandeln.',
           en:'An answering machine: if nobody is home, "someone" still picks up – the caller does not need a special case.'},
  use:{de:['null-Checks wuchern durch den Code','Optionale Abhängigkeiten (Logger, Tracing)','Standard-Verhalten für „nicht gefunden"'],
       en:['null checks proliferating through code','Optional dependencies (logger, tracing)','Default behavior for "not found"']},
  pros:{de:['Weniger Verzweigungen, weniger NullReference-Fehler','Client-Code bleibt linear lesbar','Kombiniert gut mit Factory/DI'],
        en:['Fewer branches, fewer null reference errors','Client code stays linearly readable','Combines well with Factory/DI']},
  cons:{de:['Fehler werden evtl. still verschluckt','„Nichts tun" muss wirklich korrekt sein','Zusätzliche Klasse pro Interface'],
        en:['Errors may be silently swallowed','"Do nothing" must actually be correct','Extra class per interface']},
  related:['strategy','state','factory-method'],
  csharp:
`public interface ILogger { void Log(string msg); }

public class ConsoleLogger : ILogger
{
    public void Log(string msg) => Console.WriteLine($"LOG: {msg}");
}

// Das Null Object – gleiche Schnittstelle, tut nichts:
public class NullLogger : ILogger
{
    public static readonly NullLogger Instance = new();
    public void Log(string msg) { /* bewusst leer */ }
}

public class PaymentService(ILogger logger)
{
    public void Pay(decimal amount)
    {
        // KEIN if (logger != null) nötig!
        logger.Log($"Zahlung über {amount} € gestartet");
        Console.WriteLine("Zahlung verarbeitet.");
    }
}

new PaymentService(new ConsoleLogger()).Pay(9.99m); // mit Log
new PaymentService(NullLogger.Instance).Pay(9.99m); // still`,
  python:
`class ConsoleLogger:
    def log(self, msg): print(f"LOG: {msg}")

class NullLogger:                # gleiche Schnittstelle, tut nichts
    def log(self, msg): pass     # bewusst leer

class PaymentService:
    def __init__(self, logger=None):
        self._logger = logger or NullLogger()   # nie None!

    def pay(self, amount):
        # KEIN "if self._logger is not None" nötig:
        self._logger.log(f"Zahlung über {amount} € gestartet")
        print("Zahlung verarbeitet.")

PaymentService(ConsoleLogger()).pay(9.99)   # mit Log
PaymentService().pay(9.99)                  # still – kein Fehler`
},
{
  id:'specification', name:'Specification', cat:'behavioral', gof:false, icon:'✅',
  short:{de:'Verpackt Geschäftsregeln als kombinierbare Objekte: regel1.And(regel2).Or(regel3).',
         en:'Wraps business rules as combinable objects: rule1.And(rule2).Or(rule3).'},
  intent:{de:'Eine Specification beantwortet für ein Objekt genau eine Frage: „Erfüllst du dieses Kriterium?" Über And/Or/Not lassen sich Regeln wie Bausteine kombinieren – wiederverwendbar in Validierung, Filterung und Datenbankabfragen. Stammt aus dem Domain-Driven Design (Eric Evans & Martin Fowler).',
          en:'A specification answers exactly one question about an object: "Do you satisfy this criterion?" Via And/Or/Not, rules combine like building blocks – reusable in validation, filtering and database queries. Originates from domain-driven design (Eric Evans & Martin Fowler).'},
  analogy:{de:'Eine Checkliste beim Autokauf: „unter 10.000 €" UND „weniger als 100.000 km" ODER „Garantie". Jede Karte ist eine Regel – du kombinierst sie beliebig.',
           en:'A car-buying checklist: "under €10,000" AND "less than 100,000 km" OR "warranty". Each card is a rule – you combine them freely.'},
  use:{de:['Komplexe, kombinierbare Geschäftsregeln','Gleiche Regel für Validierung UND Abfrage nutzen','Regeln einzeln testbar machen'],
       en:['Complex, combinable business rules','Using the same rule for validation AND querying','Making rules individually testable']},
  pros:{de:['Regeln wiederverwendbar und kombinierbar','Fachlogik explizit benannt','Einzeln unit-testbar'],
        en:['Rules reusable and combinable','Domain logic explicitly named','Individually unit-testable']},
  cons:{de:['Overhead für simple Bedingungen','Übersetzung in SQL erfordert Zusatzaufwand','Regel-Explosion ohne Disziplin'],
        en:['Overhead for simple conditions','Translating to SQL needs extra work','Rule explosion without discipline']},
  related:['composite','strategy','interpreter','repository'],
  csharp:
`public abstract class Spec<T>
{
    public abstract bool IsSatisfiedBy(T item);
    public Spec<T> And(Spec<T> other) => new AndSpec<T>(this, other);
    public Spec<T> Or(Spec<T> other)  => new OrSpec<T>(this, other);
}
public class AndSpec<T>(Spec<T> a, Spec<T> b) : Spec<T>
{
    public override bool IsSatisfiedBy(T i)
        => a.IsSatisfiedBy(i) && b.IsSatisfiedBy(i);
}
public class OrSpec<T>(Spec<T> a, Spec<T> b) : Spec<T>
{
    public override bool IsSatisfiedBy(T i)
        => a.IsSatisfiedBy(i) || b.IsSatisfiedBy(i);
}

public record Car(decimal Price, int Km);
public class Cheap : Spec<Car>
{ public override bool IsSatisfiedBy(Car c) => c.Price < 10000; }
public class LowMileage : Spec<Car>
{ public override bool IsSatisfiedBy(Car c) => c.Km < 100000; }

var goodDeal = new Cheap().And(new LowMileage());
Console.WriteLine(goodDeal.IsSatisfiedBy(new Car(8500, 60000)));
// True`,
  python:
`from abc import ABC, abstractmethod

class Spec(ABC):
    @abstractmethod
    def is_satisfied_by(self, item) -> bool: ...
    def __and__(self, other): return AndSpec(self, other)
    def __or__(self, other):  return OrSpec(self, other)

class AndSpec(Spec):
    def __init__(self, a, b): self.a, self.b = a, b
    def is_satisfied_by(self, i):
        return self.a.is_satisfied_by(i) and self.b.is_satisfied_by(i)

class OrSpec(Spec):
    def __init__(self, a, b): self.a, self.b = a, b
    def is_satisfied_by(self, i):
        return self.a.is_satisfied_by(i) or self.b.is_satisfied_by(i)

class Cheap(Spec):
    def is_satisfied_by(self, car): return car["price"] < 10000

class LowMileage(Spec):
    def is_satisfied_by(self, car): return car["km"] < 100000

good_deal = Cheap() & LowMileage()      # Operator-Overloading!
print(good_deal.is_satisfied_by({"price": 8500, "km": 60000}))
# True`
}
);
</script>
