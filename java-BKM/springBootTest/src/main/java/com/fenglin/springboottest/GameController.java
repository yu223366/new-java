package com.fenglin.springboottest;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Announcement;
import com.fenglin.springboottest.entity.Chapter;
import com.fenglin.springboottest.entity.Gym;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.entity.Player;
import com.fenglin.springboottest.entity.Skill;
import com.fenglin.springboottest.mapper.AnnouncementMapper;
import com.fenglin.springboottest.mapper.ChapterMapper;
import com.fenglin.springboottest.mapper.GymMapper;
import com.fenglin.springboottest.mapper.ItemMapper;
import com.fenglin.springboottest.mapper.PlayerMapper;
import com.fenglin.springboottest.mapper.SkillMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 游戏数据接口：全服公告、玩家存档、市集
 */
@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private PlayerMapper playerMapper;
    @Autowired
    private AnnouncementMapper announcementMapper;
    @Autowired
    private ItemMapper itemMapper;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private SkillMapper skillMapper;
    @Autowired
    private GymMapper gymMapper;
    @Autowired
    private ChapterMapper chapterMapper;

    /** 全服公告（前端轮播用） */
    @GetMapping("/announcements")
    public Result<List<Announcement>> announcements() {
        List<Announcement> list = announcementMapper.selectList(
                new QueryWrapper<Announcement>()
                        .eq("visible", 1)
                        .orderByDesc("create_time")
                        .last("limit 20"));
        return Result.ok(list);
    }

    /** 加载玩家存档（换设备可恢复） */
    @PostMapping("/load")
    public Result<Map<String, Object>> load(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isEmpty()) return Result.fail("缺少用户名");
        Player p = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", username));
        if (p == null) {
            p = new Player();
            p.setUsername(username);
            p.setCoins(0);
            p.setStarterChosen(0);
            p.setBanned(0);
            playerMapper.insert(p);
        }
        if (p.getBanned() != null && p.getBanned() == 1) return Result.fail(403, "该账号已被封禁");
        Map<String, Object> data = new HashMap<>();
        data.put("coins", p.getCoins());
        data.put("starterChosen", p.getStarterChosen());
        data.put("state", p.getStateJson());
        return Result.ok(data);
    }

    /** 保存玩家存档 */
    @PostMapping("/save")
    public Result<Void> save(@RequestBody Map<String, Object> body) {
        Object uo = body.get("username");
        if (uo == null) return Result.fail("缺少用户名");
        String username = String.valueOf(uo);
        if (username.isEmpty() || "null".equals(username)) return Result.fail("缺少用户名");
        Player p = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", username));
        if (p == null) {
            p = new Player();
            p.setUsername(username);
            p.setBanned(0);
        }
        Object state = body.get("state");
        if (state != null) {
            try {
                p.setStateJson(objectMapper.writeValueAsString(state));
            } catch (Exception e) {
                return Result.fail("存档序列化失败");
            }
        }
        Object coins = body.get("coins");
        if (coins instanceof Number) p.setCoins(((Number) coins).intValue());
        Object sc = body.get("starterChosen");
        if (sc instanceof Boolean) p.setStarterChosen(((Boolean) sc) ? 1 : 0);
        if (p.getId() == null) playerMapper.insert(p);
        else playerMapper.updateById(p);
        return Result.ok();
    }

    /** 市集商品（仅上架） */
    @GetMapping("/shop")
    public Result<List<Item>> shop() {
        return Result.ok(itemMapper.selectList(
                new QueryWrapper<Item>().eq("enabled", 1).orderByAsc("sort")));
    }

    /** 技能库（前台工具百科同步） */
    @GetMapping("/skills")
    public Result<List<Skill>> skills() {
        return Result.ok(skillMapper.selectList(new QueryWrapper<Skill>().orderByAsc("id")));
    }

    /** 道馆列表（前台道馆挑战同步） */
    @GetMapping("/gyms")
    public Result<List<Gym>> gyms() {
        return Result.ok(gymMapper.selectList(new QueryWrapper<Gym>().orderByAsc("id")));
    }

    /** 原著资料库篇章（前台资料库同步） */
    @GetMapping("/chapters")
    public Result<List<Chapter>> chapters() {
        return Result.ok(chapterMapper.selectList(new QueryWrapper<Chapter>().orderByAsc("sort")));
    }

    /** 购买道具（服务端校验金币） */
    @PostMapping("/buy")
    public Result<Map<String, Object>> buy(@RequestBody Map<String, Object> body) {
        Object uo = body.get("username");
        Object io = body.get("itemName");
        if (uo == null || io == null) return Result.fail("参数不完整");
        String username = String.valueOf(uo);
        String itemName = String.valueOf(io);
        int qty = body.get("qty") instanceof Number ? ((Number) body.get("qty")).intValue() : 1;
        if (qty < 1) qty = 1;
        Item item = itemMapper.selectOne(new QueryWrapper<Item>().eq("name", itemName));
        if (item == null || item.getEnabled() == null || item.getEnabled() != 1) {
            return Result.fail("商品不存在或已下架");
        }
        Player p = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", username));
        if (p == null) return Result.fail("玩家不存在");
        int cost = item.getPrice() * qty;
        if (p.getCoins() == null || p.getCoins() < cost) return Result.fail("币不足，无法购买");
        p.setCoins(p.getCoins() - cost);
        playerMapper.updateById(p);
        Map<String, Object> data = new HashMap<>();
        data.put("coins", p.getCoins());
        data.put("cost", cost);
        return Result.ok(data);
    }

    // ==================== 联机：在线状态 / 玩家对战邀请 ====================

    /** 在线表：username -> 最后一次心跳时间（毫秒） */
    private static final Map<String, Long> ONLINE = new ConcurrentHashMap<>();
    /** 邀请表：id -> 邀请信息 */
    private static final Map<String, Map<String, Object>> CHALLENGES = new ConcurrentHashMap<>();
    private static final long ONLINE_TTL = 90_000L;

    private List<Map<String, Object>> onlineList(String exclude) {
        long now = System.currentTimeMillis();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, Long> e : ONLINE.entrySet()) {
            if (now - e.getValue() > ONLINE_TTL) continue;
            if (exclude != null && exclude.equals(e.getKey())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("username", e.getKey());
            list.add(m);
        }
        list.sort((a, b) -> String.valueOf(a.get("username")).compareTo(String.valueOf(b.get("username"))));
        return list;
    }

    /** 心跳 + 返回在线列表（排除自己） */
    @PostMapping("/heartbeat")
    public Result<List<Map<String, Object>>> heartbeat(@RequestBody Map<String, String> b) {
        String u = b.get("username");
        if (u != null && !u.isEmpty()) ONLINE.put(u, System.currentTimeMillis());
        return Result.ok(onlineList(u));
    }

    /** 在线玩家列表 */
    @GetMapping("/online")
    public Result<List<Map<String, Object>>> online(@RequestParam(required = false) String username) {
        return Result.ok(onlineList(username));
    }

    /** 发起对战邀请 */
    @PostMapping("/challenge")
    public Result<Map<String, Object>> challenge(@RequestBody Map<String, String> b) {
        String from = b.get("from");
        String to = b.get("to");
        if (from == null || to == null || from.isEmpty() || to.isEmpty()) return Result.fail("参数不完整");
        if (from.equals(to)) return Result.fail("不能邀请自己");
        for (Map<String, Object> c : CHALLENGES.values()) {
            if ("pending".equals(c.get("status")) && from.equals(c.get("from")) && to.equals(c.get("to"))) {
                return Result.ok(c);
            }
        }
        Map<String, Object> c = new HashMap<>();
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        c.put("id", id);
        c.put("from", from);
        c.put("to", to);
        c.put("status", "pending");
        c.put("time", System.currentTimeMillis());
        CHALLENGES.put(id, c);
        return Result.ok(c);
    }

    /** 我收到 / 我发出的邀请 */
    @GetMapping("/challenges")
    public Result<List<Map<String, Object>>> challenges(@RequestParam String username) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> c : CHALLENGES.values()) {
            if (username.equals(c.get("to")) || username.equals(c.get("from"))) out.add(c);
        }
        return Result.ok(out);
    }

    /** 接受 / 拒绝邀请（接受时返回对方队伍快照，用于双方各自对战） */
    @SuppressWarnings("unchecked")
    @PostMapping("/challenge/respond")
    public Result<Map<String, Object>> respond(@RequestBody Map<String, String> b) {
        String id = b.get("id");
        String action = b.get("action");
        String username = b.get("username");
        Map<String, Object> c = CHALLENGES.get(id);
        if (c == null) return Result.fail("邀请已失效");
        if (!"pending".equals(c.get("status"))) return Result.fail("该邀请已处理");
        if (!"accept".equals(action) && !"reject".equals(action)) return Result.fail("动作错误");

        if ("reject".equals(action)) {
            c.put("status", "rejected");
            return Result.ok(c);
        }

        String opponent = (username != null && username.equals(c.get("to")))
                ? String.valueOf(c.get("from"))
                : String.valueOf(c.get("to"));
        c.put("status", "accepted");
        c.put("acceptedBy", username);

        Player op = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", opponent));
        List<Object> team = new ArrayList<>();
        if (op != null && op.getStateJson() != null) {
            try {
                Map<String, Object> state = objectMapper.readValue(op.getStateJson(), Map.class);
                Object bag = state.get("bag");
                if (bag instanceof List) {
                    List<Object> bl = (List<Object>) bag;
                    team.addAll(bl.subList(0, Math.min(6, bl.size())));
                }
            } catch (Exception ignored) {
            }
        }
        Map<String, Object> data = new HashMap<>(c);
        data.put("opponent", opponent);
        data.put("opponentTeam", team);
        return Result.ok(data);
    }

    /** 查询邀请状态（发起方轮询对方是否接受） */
    @GetMapping("/challenge/status")
    public Result<Map<String, Object>> challengeStatus(@RequestParam String id) {
        Map<String, Object> c = CHALLENGES.get(id);
        if (c == null) return Result.fail("邀请已失效");
        return Result.ok(c);
    }

    /** 取某玩家出战队伍（前 6 只），用于联机对战 */
    @SuppressWarnings("unchecked")
    @GetMapping("/team")
    public Result<List<Object>> team(@RequestParam String username) {
        Player p = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", username));
        List<Object> team = new ArrayList<>();
        if (p != null && p.getStateJson() != null) {
            try {
                Map<String, Object> state = objectMapper.readValue(p.getStateJson(), Map.class);
                Object bag = state.get("bag");
                if (bag instanceof List) {
                    List<Object> bl = (List<Object>) bag;
                    team.addAll(bl.subList(0, Math.min(6, bl.size())));
                }
            } catch (Exception ignored) {
            }
        }
        return Result.ok(team);
    }

    // ==================== 宝可梦交换（宝可梦中心） ====================

    /** 交换邀请表：id -> {id, from, to, fromPokemon, toPokemon, status, time} */
    private static final Map<String, Map<String, Object>> TRADES = new ConcurrentHashMap<>();

    /** 发起交换邀请（A 选好自己的宝可梦，邀请 B） */
    @PostMapping("/trade")
    public Result<Map<String, Object>> trade(@RequestBody Map<String, Object> b) {
        Object fo = b.get("from");
        Object to = b.get("to");
        Object poke = b.get("pokemon");
        if (fo == null || to == null || poke == null) return Result.fail("参数不完整");
        String from = String.valueOf(fo);
        String toU = String.valueOf(to);
        if (from.equals(toU)) return Result.fail("不能和自己交换宝可梦");
        boolean online = onlineList(null).stream()
                .anyMatch(m -> toU.equals(m.get("username")));
        if (!online) return Result.fail("对方不在线，无法交换");
        for (Map<String, Object> t : TRADES.values()) {
            if ("pending".equals(t.get("status")) && from.equals(t.get("from")) && toU.equals(t.get("to"))) {
                return Result.ok(t);
            }
        }
        Map<String, Object> t = new HashMap<>();
        String id = java.util.UUID.randomUUID().toString().substring(0, 8);
        t.put("id", id);
        t.put("from", from);
        t.put("to", toU);
        t.put("fromPokemon", poke);
        t.put("status", "pending");
        t.put("time", System.currentTimeMillis());
        TRADES.put(id, t);
        return Result.ok(t);
    }

    /** 我的交换邀请（收到 + 发出） */
    @GetMapping("/trades")
    public Result<List<Map<String, Object>>> trades(@RequestParam String username) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> t : TRADES.values()) {
            if (username.equals(t.get("to")) || username.equals(t.get("from"))) out.add(t);
        }
        return Result.ok(out);
    }

    /** 响应交换：accept（带 B 的宝可梦）时执行交换 / reject */
    @SuppressWarnings("unchecked")
    @PostMapping("/trade/respond")
    public Result<Map<String, Object>> tradeRespond(@RequestBody Map<String, Object> b) {
        String id = String.valueOf(b.get("id"));
        String action = String.valueOf(b.get("action"));
        Map<String, Object> t = TRADES.get(id);
        if (t == null) return Result.fail("交换邀请已失效");
        if (!"pending".equals(t.get("status"))) return Result.fail("该邀请已处理");

        if ("reject".equals(action)) {
            t.put("status", "rejected");
            return Result.ok(t);
        }
        if (!"accept".equals(action)) return Result.fail("动作错误");

        Object poke = b.get("pokemon");
        if (poke == null || !(poke instanceof Map)) return Result.fail("请先选择要交换的宝可梦");

        String from = String.valueOf(t.get("from"));
        String to = String.valueOf(t.get("to"));
        Map<String, Object> pokeA = (Map<String, Object>) t.get("fromPokemon");
        Map<String, Object> pokeB = (Map<String, Object>) poke;

        Player pa = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", from));
        Player pb = playerMapper.selectOne(new QueryWrapper<Player>().eq("username", to));
        if (pa == null || pb == null || pa.getStateJson() == null || pb.getStateJson() == null) {
            return Result.fail("双方存档不存在，无法交换");
        }

        try {
            Map<String, Object> sa = objectMapper.readValue(pa.getStateJson(), Map.class);
            Map<String, Object> sb = objectMapper.readValue(pb.getStateJson(), Map.class);
            List<Object> bagA = sa.get("bag") instanceof List ? (List<Object>) sa.get("bag") : new ArrayList<>();
            List<Object> bagB = sb.get("bag") instanceof List ? (List<Object>) sb.get("bag") : new ArrayList<>();

            String uidA = pokeA.get("uid") == null ? "" : String.valueOf(pokeA.get("uid"));
            String uidB = pokeB.get("uid") == null ? "" : String.valueOf(pokeB.get("uid"));

            boolean removedA = false;
            boolean removedB = false;
            for (int i = bagA.size() - 1; i >= 0; i--) {
                Object x = bagA.get(i);
                if (x instanceof Map && String.valueOf(((Map<String, Object>) x).get("uid")).equals(uidA)) {
                    bagA.remove(i);
                    removedA = true;
                }
            }
            for (int i = bagB.size() - 1; i >= 0; i--) {
                Object x = bagB.get(i);
                if (x instanceof Map && String.valueOf(((Map<String, Object>) x).get("uid")).equals(uidB)) {
                    bagB.remove(i);
                    removedB = true;
                }
            }
            if (!removedA || !removedB) return Result.fail("宝可梦已被移动，交换失败");

            bagA.add(pokeB);   // A 得到 B 的宝可梦
            bagB.add(pokeA);   // B 得到 A 的宝可梦

            sa.put("bag", bagA);
            sb.put("bag", bagB);
            pa.setStateJson(objectMapper.writeValueAsString(sa));
            pb.setStateJson(objectMapper.writeValueAsString(sb));
            playerMapper.updateById(pa);
            playerMapper.updateById(pb);
        } catch (Exception e) {
            return Result.fail("交换执行失败：" + e.getMessage());
        }

        t.put("toPokemon", pokeB);
        t.put("status", "completed");
        Map<String, Object> data = new HashMap<>(t);
        data.put("fromPokemon", pokeA);
        data.put("toPokemon", pokeB);
        return Result.ok(data);
    }
}
