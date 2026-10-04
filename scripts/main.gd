extends Node2D

const SAVE_PATH := "user://dave_save.json"
var dirt := 0.0
var cash := 0.0
var daves := 1
var shovel_level := 1
var depth := 0.0
var lifetime_dirt := 0.0
var last_save_ms := 0
var rng := RandomNumberGenerator.new()

var dirt_label: Label
var cash_label: Label
var dave_label: Label
var depth_label: Label
var shovel_button: Button
var dave_button: Button
var sell_button: Button
var field: Node2D
var dave_sprites: Array[Node2D] = []
var initialized := false

func _ready() -> void:
    rng.randomize()
    _build_ui()
    _load_game()
    _rebuild_daves()
    _update_ui()
    initialized = true
    last_save_ms = Time.get_ticks_msec()

func _process(delta: float) -> void:
    if not initialized:
        return
    var dug := dig_rate() * delta
    dirt += dug
    lifetime_dirt += dug
    depth += dug * 0.018
    _update_ui()
    if Time.get_ticks_msec() - last_save_ms > 5000:
        _save_game()
        last_save_ms = Time.get_ticks_msec()

func dig_rate() -> float:
    return daves * (1.0 + (shovel_level - 1) * 0.55)

func dave_cost() -> float:
    return floor(12.0 * pow(1.24, daves - 1))

func shovel_cost() -> float:
    return floor(20.0 * pow(1.7, shovel_level - 1))

func _build_ui() -> void:
    RenderingServer.set_default_clear_color(Color("#d8b06c"))
    var bg := ColorRect.new()
    bg.color = Color("#d8b06c")
    bg.position = Vector2.ZERO
    bg.size = Vector2(1280,720)
    add_child(bg)

    var title := Label.new()
    title.text = "DAVE"
    title.position = Vector2(38,22)
    title.add_theme_font_size_override("font_size", 52)
    add_child(title)
    var sub := Label.new()
    sub.text = "DIGS. BUILDS. MULTIPLIES. NO THOUGHTS."
    sub.position = Vector2(42,82)
    sub.add_theme_font_size_override("font_size", 16)
    add_child(sub)

    var pit := Polygon2D.new()
    pit.polygon = PackedVector2Array([Vector2(0,0),Vector2(770,0),Vector2(690,520),Vector2(80,520)])
    pit.color = Color("#79563b")
    pit.position = Vector2(35,145)
    add_child(pit)

    field = Node2D.new()
    field.position = Vector2(70,180)
    add_child(field)

    var panel := ColorRect.new()
    panel.color = Color("#1e2429")
    panel.position = Vector2(840,24)
    panel.size = Vector2(410,672)
    add_child(panel)

    dirt_label = _make_label(Vector2(875,60), 28)
    cash_label = _make_label(Vector2(875,104), 28)
    dave_label = _make_label(Vector2(875,148), 22)
    depth_label = _make_label(Vector2(875,182), 18)

    var divider := HSeparator.new()
    divider.position = Vector2(875,225)
    divider.size = Vector2(340,4)
    add_child(divider)

    sell_button = _make_button("SELL ALL DIRT", Vector2(875,250), Vector2(340,64))
    sell_button.pressed.connect(_sell_dirt)
    dave_button = _make_button("", Vector2(875,334), Vector2(340,76))
    dave_button.pressed.connect(_buy_dave)
    shovel_button = _make_button("", Vector2(875,430), Vector2(340,76))
    shovel_button.pressed.connect(_buy_shovel)

    var tip := Label.new()
    tip.text = "DAVE digs automatically.\nSell dirt. Buy Dave.\nDave does not ask why."
    tip.position = Vector2(878,550)
    tip.add_theme_font_size_override("font_size", 18)
    add_child(tip)

func _make_label(pos: Vector2, size: int) -> Label:
    var l := Label.new()
    l.position = pos
    l.add_theme_font_size_override("font_size", size)
    add_child(l)
    return l

func _make_button(text: String, pos: Vector2, size: Vector2) -> Button:
    var b := Button.new()
    b.text = text
    b.position = pos
    b.size = size
    b.add_theme_font_size_override("font_size", 20)
    add_child(b)
    return b

func _rebuild_daves() -> void:
    for n in dave_sprites:
        n.queue_free()
    dave_sprites.clear()
    var shown: int = mini(daves, 80)
    for i in range(shown):
        var dude := Node2D.new()
        dude.position = Vector2(45 + (i % 10) * 67 + rng.randf_range(-8,8), 50 + (i / 10) * 56 + rng.randf_range(-5,5))
        field.add_child(dude)
        var body := Polygon2D.new()
        body.polygon = PackedVector2Array([Vector2(-12,-6),Vector2(12,-6),Vector2(16,23),Vector2(-16,23)])
        body.color = Color("#e7c19b")
        dude.add_child(body)
        var head := Polygon2D.new()
        head.polygon = PackedVector2Array([Vector2(-14,-24),Vector2(13,-25),Vector2(17,-9),Vector2(-15,-8)])
        head.color = Color("#f0caa5")
        dude.add_child(head)
        var hat := Polygon2D.new()
        hat.polygon = PackedVector2Array([Vector2(-18,-27),Vector2(18,-27),Vector2(10,-37),Vector2(-9,-37)])
        hat.color = Color("#e4a62a")
        dude.add_child(hat)
        var eye1 := Polygon2D.new()
        eye1.polygon = _circle_poly(Vector2(-7,-18),5,10)
        eye1.color = Color.WHITE
        dude.add_child(eye1)
        var eye2 := Polygon2D.new()
        eye2.polygon = _circle_poly(Vector2(8,-16),6,10)
        eye2.color = Color.WHITE
        dude.add_child(eye2)
        var pick := Line2D.new()
        pick.points = PackedVector2Array([Vector2(13,4),Vector2(31,24)])
        pick.width = 4
        pick.default_color = Color("#4a382c")
        dude.add_child(pick)
        dave_sprites.append(dude)

func _circle_poly(center: Vector2, radius: float, points: int) -> PackedVector2Array:
    var arr := PackedVector2Array()
    for i in range(points):
        var a := TAU * float(i) / float(points)
        arr.append(center + Vector2(cos(a), sin(a)) * radius)
    return arr

func _sell_dirt() -> void:
    cash += floor(dirt)
    dirt -= floor(dirt)

func _buy_dave() -> void:
    var cost := dave_cost()
    if cash >= cost:
        cash -= cost
        daves += 1
        _rebuild_daves()
        _save_game()

func _buy_shovel() -> void:
    var cost := shovel_cost()
    if cash >= cost:
        cash -= cost
        shovel_level += 1
        _save_game()

func _update_ui() -> void:
    dirt_label.text = "DIRT   %s" % _fmt(dirt)
    cash_label.text = "$      %s" % _fmt(cash)
    dave_label.text = "DAVES  %d     DIG/SEC  %s" % [daves, _fmt(dig_rate())]
    depth_label.text = "HOLE DEPTH  %.1f m" % depth
    dave_button.text = "BUY ANOTHER DAVE\n$%s" % _fmt(dave_cost())
    shovel_button.text = "BETTER SHOVELS  LV.%d\n$%s" % [shovel_level, _fmt(shovel_cost())]
    dave_button.disabled = cash < dave_cost()
    shovel_button.disabled = cash < shovel_cost()
    sell_button.text = "SELL ALL DIRT  +$%s" % _fmt(floor(dirt))

func _fmt(v: float) -> String:
    if v >= 1000000000: return "%.2fB" % (v / 1000000000.0)
    if v >= 1000000: return "%.2fM" % (v / 1000000.0)
    if v >= 1000: return "%.1fK" % (v / 1000.0)
    return str(int(v))

func _save_game() -> void:
    var data := {"dirt":dirt,"cash":cash,"daves":daves,"shovel_level":shovel_level,"depth":depth,"lifetime_dirt":lifetime_dirt,"saved_unix":Time.get_unix_time_from_system()}
    var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if f: f.store_string(JSON.stringify(data))

func _load_game() -> void:
    if not FileAccess.file_exists(SAVE_PATH): return
    var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if not f: return
    var data = JSON.parse_string(f.get_as_text())
    if typeof(data) != TYPE_DICTIONARY: return
    dirt = float(data.get("dirt",0.0))
    cash = float(data.get("cash",0.0))
    daves = int(data.get("daves",1))
    shovel_level = int(data.get("shovel_level",1))
    depth = float(data.get("depth",0.0))
    lifetime_dirt = float(data.get("lifetime_dirt",0.0))
    var away: float = clampf(Time.get_unix_time_from_system() - float(data.get("saved_unix",Time.get_unix_time_from_system())), 0.0, 14400.0)
    var offline := dig_rate() * away * 0.35
    dirt += offline
    lifetime_dirt += offline
    depth += offline * 0.018

func _notification(what: int) -> void:
    if what == NOTIFICATION_WM_CLOSE_REQUEST:
        _save_game()
        get_tree().quit()
