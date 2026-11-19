<template>
  <div class="page admin-page">
    <header class="navbar">
      <div class="nav-inner">
        <div class="brand"><span class="pokeball"></span> 后台管理系统 <small>POKéDEX ADMIN</small></div>
        <div class="nav-user">
          <span class="username">管理员：{{ user?.username }}</span>
          <router-link to="/home" class="btn btn-ghost btn-sm">返回前台</router-link>
          <button class="btn btn-primary btn-sm" @click="logout">退出</button>
        </div>
      </div>
    </header>

    <main class="admin-main">
      <!-- 模块 Tab -->
      <div class="adm-tabs">
        <button v-for="t in tabs" :key="t.key" :class="['adm-tab', { active: tab === t.key }]" @click="switchTab(t.key)">
          {{ t.icon }} {{ t.label }}
        </button>
      </div>

      <!-- 1. 数据仪表盘 -->
      <section v-if="tab === 'stats'" class="panel">
        <h3>📊 数据仪表盘</h3>
        <div class="stat-grid">
          <div class="stat-card"><b>{{ stats.players || 0 }}</b><span>注册玩家</span></div>
          <div class="stat-card"><b>{{ stats.items || 0 }}</b><span>市集道具</span></div>
          <div class="stat-card"><b>{{ stats.skills || 0 }}</b><span>技能</span></div>
          <div class="stat-card"><b>{{ stats.gyms || 0 }}</b><span>道馆</span></div>
          <div class="stat-card"><b>{{ stats.chapters || 0 }}</b><span>资料篇章</span></div>
          <div class="stat-card"><b>{{ stats.announcements || 0 }}</b><span>全服公告</span></div>
          <div class="stat-card gold"><b>{{ stats.legendCaptures || 0 }}</b><span>神兽捕获次数</span></div>
          <div class="stat-card"><b>{{ stats.gymAnnouncements || 0 }}</b><span>道馆通关公告</span></div>
        </div>
      </section>

      <!-- 2. 玩家管理 -->
      <section v-else-if="tab === 'players'" class="panel">
        <h3>👤 玩家管理（{{ players.length }}）</h3>
        <table class="adm-table">
          <thead><tr><th>ID</th><th>账号</th><th>金币</th><th>初始精灵</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="p in players" :key="p.id">
              <td>{{ p.id }}</td>
              <td><b>{{ p.username }}</b></td>
              <td>{{ p.coins }}</td>
              <td>{{ p.starterChosen ? '已选' : '未选' }}</td>
              <td><span :class="['tagline', p.banned ? 'bg-err' : 'bg-ok']">{{ p.banned ? '封禁' : '正常' }}</span></td>
              <td class="nowrap">{{ fmt(p.updateTime) }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openDetail(p)">详情</button>
                <button class="btn-sm-ghost" @click="openGrant(p)">发放</button>
                <button class="btn-sm-ghost" @click="editCoins(p)">改币</button>
                <button class="btn-sm-ghost" @click="toggleBan(p)">{{ p.banned ? '解封' : '封禁' }}</button>
                <button class="btn-sm-ghost danger" @click="delPlayer(p)">删号</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 3. 图鉴管理 -->
      <section v-else-if="tab === 'pokedex'" class="panel">
        <div class="section-head"><h3>📖 宝可梦图鉴管理（{{ dexList.length }}）</h3>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="openAdd">+ 新增</button>
        </div>
        <table class="adm-table">
          <thead><tr><th>编号</th><th>宝可梦</th><th>属性</th><th>等级</th><th>分类</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="p in dexList" :key="p.id">
              <td class="no-cell">No.{{ p.number }}</td>
              <td><img :src="p.image" class="pk-img" /> <b>{{ p.name }}</b></td>
              <td><span :class="['type','type-'+p.category]">{{ p.category }}</span></td>
              <td><span :class="['badge','lv-'+p.level]">{{ p.level }}</span></td>
              <td>{{ p.classification }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openEdit(p)">编辑</button>
                <button class="btn-sm-ghost danger" @click="remove(p)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 4. 技能库 -->
      <section v-else-if="tab === 'skills'" class="panel">
        <div class="section-head"><h3>⚔ 技能库管理（{{ skills.length }}）</h3>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="openSkill()">+ 新增技能</button>
        </div>
        <table class="adm-table">
          <thead><tr><th>技能名</th><th>属性</th><th>分类</th><th>威力</th><th>命中</th><th>PP</th><th>效果</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="s in skills" :key="s.id">
              <td><b>{{ s.name }}</b></td>
              <td><span :class="['type','type-'+s.type]">{{ s.type }}</span></td>
              <td>{{ s.category }}</td>
              <td>{{ s.power || '—' }}</td>
              <td>{{ s.accuracy }}</td>
              <td>{{ s.pp }}</td>
              <td class="desc-cell">{{ s.effect }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openSkill(s)">编辑</button>
                <button class="btn-sm-ghost danger" @click="delSkill(s)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 5. 市集道具 -->
      <section v-else-if="tab === 'items'" class="panel">
        <div class="section-head"><h3>🛒 市集道具管理（{{ items.length }}）</h3>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="openItem()">+ 新增道具</button>
        </div>
        <table class="adm-table">
          <thead><tr><th>道具</th><th>分类</th><th>价格(币)</th><th>倍率</th><th>效果</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="it in items" :key="it.id">
              <td><b>{{ it.name }}</b></td>
              <td>{{ it.category }}</td>
              <td><input v-model.number="it.price" class="mini-input" @change="updateItem(it)" /></td>
              <td>{{ it.mult }}</td>
              <td class="desc-cell">{{ it.effect }}</td>
              <td><span :class="['tagline', it.enabled ? 'bg-ok' : 'bg-lock']">{{ it.enabled ? '上架' : '下架' }}</span></td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openItem(it)">编辑</button>
                <button class="btn-sm-ghost" @click="toggleItem(it)">{{ it.enabled ? '下架' : '上架' }}</button>
                <button class="btn-sm-ghost danger" @click="delItem(it)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 6. 道馆 & 地区 -->
      <section v-else-if="tab === 'gyms'" class="panel">
        <div class="section-head"><h3>🗺 道馆与地区管理（{{ gyms.length }} 座道馆）</h3>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="openGym()">+ 新增道馆</button>
        </div>

        <h4 style="font-size:14px;color:var(--poke-blue);margin-bottom:8px">地区解锁配置</h4>
        <table class="adm-table" style="margin-bottom:18px">
          <thead><tr><th>地区</th><th>排序</th><th>解锁所需徽章</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="r in regions" :key="r.id">
              <td><b>{{ r.name }}</b></td>
              <td>{{ r.sort }}</td>
              <td><input v-model.number="r.requireBadge" class="mini-input" @change="saveRegion(r)" /></td>
              <td><span :class="['tagline', r.unlocked ? 'bg-ok' : 'bg-lock']">{{ r.unlocked ? '已解锁' : '未解锁' }}</span></td>
              <td><button class="btn-sm-ghost" @click="toggleRegion(r)">{{ r.unlocked ? '锁定' : '解锁' }}</button></td>
            </tr>
          </tbody>
        </table>

        <h4 style="font-size:14px;color:var(--poke-blue);margin-bottom:8px">道馆列表</h4>
        <table class="adm-table">
          <thead><tr><th>ID</th><th>地区</th><th>道馆</th><th>馆主</th><th>属性</th><th>徽章</th><th>城市</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="g in gyms" :key="g.id">
              <td>{{ g.localId }}</td>
              <td>{{ g.region }}</td>
              <td><b>{{ g.name }}</b></td>
              <td>{{ g.leader }}</td>
              <td><span :class="['type','type-'+g.type]">{{ g.type }}</span></td>
              <td>{{ g.badge }}</td>
              <td>{{ g.city }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openGym(g)">编辑</button>
                <button class="btn-sm-ghost danger" @click="delGym(g)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 7. 原著资料库 -->
      <section v-else-if="tab === 'lore'" class="panel">
        <div class="section-head"><h3>📚 原著资料库管理（{{ chapters.length }}）</h3>
          <button class="btn btn-primary btn-sm" style="margin-left:auto" @click="openChapter()">+ 新增篇章</button>
        </div>
        <table class="adm-table">
          <thead><tr><th>排序</th><th>篇章</th><th>地区</th><th>年代</th><th>副标题</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="c in chapters" :key="c.id">
              <td>{{ c.sort }}</td>
              <td><b>{{ c.name }}</b></td>
              <td>{{ c.region }}</td>
              <td>{{ c.years }}</td>
              <td class="desc-cell">{{ c.tagline }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="openChapter(c)">编辑</button>
                <button class="btn-sm-ghost danger" @click="delChapter(c)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 8. 公告管理 -->
      <section v-else-if="tab === 'announcements'" class="panel">
        <h3>📢 全服公告管理</h3>
        <div class="ann-publish">
          <input v-model="annText" placeholder="输入公告内容…" class="ann-input" />
          <select v-model="annType"><option value="system">系统</option><option value="gym">道馆</option><option value="legend">神兽</option></select>
          <button class="btn btn-primary btn-sm" @click="publishAnn">发布</button>
        </div>
        <table class="adm-table">
          <thead><tr><th>ID</th><th>内容</th><th>类型</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="a in anns" :key="a.id">
              <td>{{ a.id }}</td>
              <td class="desc-cell">{{ a.content }}</td>
              <td>{{ a.type }}</td>
              <td><span :class="['tagline', a.visible ? 'bg-ok' : 'bg-lock']">{{ a.visible ? '显示' : '隐藏' }}</span></td>
              <td class="nowrap">{{ fmt(a.createTime) }}</td>
              <td class="nowrap">
                <button class="btn-sm-ghost" @click="toggleAnn(a)">{{ a.visible ? '隐藏' : '显示' }}</button>
                <button class="btn-sm-ghost danger" @click="delAnn(a)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- 9. 游戏日志 -->
      <section v-else-if="tab === 'logs'" class="panel">
        <h3>📜 游戏日志（玩家捕捉/对战汇总）</h3>
        <table class="adm-table">
          <thead><tr><th>账号</th><th>金币</th><th>捕捉次数</th><th>对战次数</th><th>最近捕捉</th><th>最近对战</th><th>更新时间</th></tr></thead>
          <tbody>
            <tr v-for="l in logs" :key="l.username">
              <td><b>{{ l.username }}</b></td>
              <td>{{ l.coins }}</td>
              <td>{{ l.captureCount }}</td>
              <td>{{ l.battleCount }}</td>
              <td>{{ l.lastCapture || '—' }}</td>
              <td>{{ l.lastBattle || '—' }}</td>
              <td class="nowrap">{{ fmt(l.updateTime) }}</td>
            </tr>
            <tr v-if="!logs.length"><td colspan="7" class="empty-tip">暂无日志</td></tr>
          </tbody>
        </table>
      </section>
    </main>

    <!-- ============ 图鉴弹窗 ============ -->
    <div v-if="dialog" class="modal-mask" @click.self="dialog = false">
      <div class="modal">
        <h3>{{ editing ? '编辑' : '新增' }}宝可梦</h3>
        <div class="form-row">
          <div class="field"><label>图鉴编号</label><input v-model="form.number" placeholder="025" /></div>
          <div class="field"><label>名称</label><input v-model="form.name" placeholder="皮卡丘" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>第一属性</label>
            <select v-model="form.category"><option v-for="c in categories" :key="c">{{ c }}</option></select>
          </div>
          <div class="field"><label>第二属性</label>
            <select v-model="form.category2"><option value="">无</option><option v-for="c in categories" :key="c">{{ c }}</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>稀有等级</label>
            <select v-model="form.level"><option v-for="l in levels" :key="l">{{ l }}</option></select>
          </div>
          <div class="field"><label>分类</label><input v-model="form.classification" placeholder="鼠宝可梦" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>身高</label><input v-model="form.height" placeholder="0.4m" /></div>
          <div class="field"><label>体重</label><input v-model="form.weight" placeholder="6.0kg" /></div>
        </div>
        <div class="field"><label>立绘路径</label><input v-model="form.image" placeholder="/pokemon/025.png" /></div>
        <div class="field"><label>介绍</label><textarea v-model="form.description" rows="2"></textarea></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="dialog = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="save">保存</button>
        </div>
      </div>
    </div>

    <!-- ============ 技能弹窗 ============ -->
    <div v-if="skillDlg" class="modal-mask" @click.self="skillDlg = false">
      <div class="modal">
        <h3>{{ skillForm.id ? '编辑' : '新增' }}技能</h3>
        <div class="form-row">
          <div class="field"><label>技能名</label><input v-model="skillForm.name" placeholder="撞击" /></div>
          <div class="field"><label>属性</label><select v-model="skillForm.type"><option v-for="c in categories" :key="c">{{ c }}</option></select></div>
        </div>
        <div class="form-row">
          <div class="field"><label>分类</label>
            <select v-model="skillForm.category"><option>物理</option><option>特殊</option><option>变化</option></select>
          </div>
          <div class="field"><label>威力</label><input v-model.number="skillForm.power" type="number" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>命中率</label><input v-model.number="skillForm.accuracy" type="number" /></div>
          <div class="field"><label>PP</label><input v-model.number="skillForm.pp" type="number" /></div>
        </div>
        <div class="field"><label>效果</label><input v-model="skillForm.effect" placeholder="附加效果说明" /></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="skillDlg = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="saveSkill">保存</button>
        </div>
      </div>
    </div>

    <!-- ============ 道具弹窗 ============ -->
    <div v-if="itemDlg" class="modal-mask" @click.self="itemDlg = false">
      <div class="modal">
        <h3>{{ itemForm.id ? '编辑' : '新增' }}市集道具</h3>
        <div class="form-row">
          <div class="field"><label>道具名</label><input v-model="itemForm.name" placeholder="精灵球" /></div>
          <div class="field"><label>分类</label>
            <select v-model="itemForm.category"><option>精灵球</option><option>药品</option><option>技能道具</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>价格(币)</label><input v-model.number="itemForm.price" type="number" /></div>
          <div class="field"><label>捕捉倍率</label><input v-model.number="itemForm.mult" type="number" step="0.1" /></div>
        </div>
        <div class="field"><label>效果</label><input v-model="itemForm.effect" placeholder="效果说明" /></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="itemDlg = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="saveItem">保存</button>
        </div>
      </div>
    </div>

    <!-- ============ 道馆弹窗 ============ -->
    <div v-if="gymDlg" class="modal-mask" @click.self="gymDlg = false">
      <div class="modal">
        <h3>{{ gymForm.id ? '编辑' : '新增' }}道馆</h3>
        <div class="form-row">
          <div class="field"><label>地区</label>
            <select v-model="gymForm.region"><option v-for="r in regionNames" :key="r">{{ r }}</option></select>
          </div>
          <div class="field"><label>区内序号</label><input v-model.number="gymForm.localId" type="number" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>道馆名</label><input v-model="gymForm.name" placeholder="尼比道馆" /></div>
          <div class="field"><label>馆主</label><input v-model="gymForm.leader" placeholder="小刚" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>属性</label><select v-model="gymForm.type"><option v-for="c in categories" :key="c">{{ c }}</option></select></div>
          <div class="field"><label>徽章名</label><input v-model="gymForm.badge" placeholder="灰色徽章" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>城市</label><input v-model="gymForm.city" placeholder="尼比市" /></div>
          <div class="field"><label>难度</label><input v-model.number="gymForm.difficulty" type="number" /></div>
        </div>
        <div class="field"><label>馆主 HP</label><input v-model.number="gymForm.hp" type="number" /></div>
        <div class="field"><label>队伍（逗号分隔）</label><input v-model="gymForm.team" placeholder="小拳石,大岩蛇" /></div>
        <div class="field"><label>介绍</label><textarea v-model="gymForm.intro" rows="2"></textarea></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="gymDlg = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="saveGym">保存</button>
        </div>
      </div>
    </div>

    <!-- ============ 资料库弹窗 ============ -->
    <div v-if="chapterDlg" class="modal-mask" @click.self="chapterDlg = false">
      <div class="modal">
        <h3>{{ chapterForm.id ? '编辑' : '新增' }}篇章</h3>
        <div class="form-row">
          <div class="field"><label>篇章名</label><input v-model="chapterForm.name" placeholder="关都篇" /></div>
          <div class="field"><label>地区</label><input v-model="chapterForm.region" placeholder="关都" /></div>
        </div>
        <div class="form-row">
          <div class="field"><label>排序</label><input v-model.number="chapterForm.sort" type="number" /></div>
          <div class="field"><label>年代</label><input v-model="chapterForm.years" placeholder="1997–2002" /></div>
        </div>
        <div class="field"><label>副标题</label><input v-model="chapterForm.tagline" placeholder="一切的起点" /></div>
        <div class="field"><label>旁白叙述</label><textarea v-model="chapterForm.narration" rows="4"></textarea></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="chapterDlg = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="saveChapter">保存</button>
        </div>
      </div>
    </div>

    <!-- ============ 玩家详情弹窗 ============ -->
    <div v-if="detail" class="modal-mask" @click.self="detail = null">
      <div class="modal" style="max-width:680px">
        <h3>👤 玩家详情 · {{ detail.username }}</h3>
        <p class="hint-line" style="margin-bottom:10px">
          金币 <b>{{ detail.coins }}</b> · 药水 <b>{{ detail.potions }}</b> · 精灵 <b>{{ detail.pokemons.length }}</b> 只 · 徽章 <b>{{ detail.badges.length }}</b> 枚
        </p>

        <h4 style="font-size:13px;color:var(--poke-blue);margin-bottom:6px">我的精灵（{{ detail.pokemons.length }}）</h4>
        <table class="adm-table" style="margin-bottom:14px">
          <thead><tr><th>精灵</th><th>等级</th><th>HP</th><th>战力</th><th>稀有度</th><th>闪光</th></tr></thead>
          <tbody>
            <tr v-for="f in detail.pokemons" :key="f.uid">
              <td><b>{{ f.name }}</b> <small class="hint-line">#{{ f.number }}</small></td>
              <td>Lv.{{ f.level }}</td>
              <td>{{ f.hp }}/{{ f.maxHp }}</td>
              <td>{{ f.power }}</td>
              <td>{{ f.rarity || f.level }}</td>
              <td>{{ f.shiny ? '✨' : '—' }}</td>
            </tr>
            <tr v-if="!detail.pokemons.length"><td colspan="6" class="empty-tip">暂无精灵</td></tr>
          </tbody>
        </table>

        <h4 style="font-size:13px;color:var(--poke-blue);margin-bottom:6px">背包道具</h4>
        <div class="gym-chips" style="margin-bottom:14px">
          <span v-for="(q, n) in detail.balls" :key="n" class="gym-chip" v-show="q > 0">{{ n }} ×{{ q }}</span>
          <span v-for="(q, n) in detail.bagItems" :key="n" class="gym-chip" v-show="q > 0">{{ n }} ×{{ q }}</span>
          <span v-if="!bagHas" class="hint-line">（空）</span>
        </div>

        <h4 style="font-size:13px;color:var(--poke-blue);margin-bottom:6px">已获徽章（{{ detail.badges.length }}）</h4>
        <div class="gym-chips" style="margin-bottom:6px">
          <span v-for="b in detail.badges" :key="b.gymId" class="gym-chip">{{ b.badge }}</span>
          <span v-if="!detail.badges.length" class="hint-line">（暂无）</span>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="detail = null">关闭</button>
        </div>
      </div>
    </div>

    <!-- ============ 发放物品弹窗 ============ -->
    <div v-if="grant" class="modal-mask" @click.self="grant = null">
      <div class="modal" style="max-width:440px">
        <h3>🎁 发放物品 · {{ grant.username }}</h3>
        <div class="field"><label>类型</label>
          <select v-model="grantKind"><option value="coins">金币</option><option value="ball">精灵球</option><option value="item">药品/技能道具</option></select>
        </div>
        <div class="field" v-if="grantKind !== 'coins'"><label>物品</label>
          <select v-model="grantName">
            <optgroup v-if="grantKind === 'ball'" label="精灵球"><option v-for="b in BALLS" :key="b.name">{{ b.name }}</option></optgroup>
            <optgroup v-if="grantKind === 'item'" label="药品"><option v-for="m in MEDICINES" :key="m.name">{{ m.name }}</option></optgroup>
            <optgroup v-if="grantKind === 'item'" label="技能道具"><option v-for="s in SKILL_ITEMS" :key="s.name">{{ s.name }}</option></optgroup>
          </select>
        </div>
        <div class="field"><label>数量</label><input v-model.number="grantQty" type="number" min="1" /></div>
        <div class="modal-actions">
          <button class="btn btn-ghost btn-sm" @click="grant = null">取消</button>
          <button class="btn btn-primary btn-sm" @click="doGrant">确认发放</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pokemonList, pokemonAdd, pokemonUpdate, pokemonDelete } from '../api'
import { adminGame } from '../api/game'
import { BALLS, MEDICINES, SKILL_ITEMS } from '../data/shop'
import { toastOk, toastWarn } from '../utils/toast'

const router = useRouter()
const user = ref(JSON.parse(sessionStorage.getItem('pokemon_user') || 'null'))

const tabs = [
  { key: 'stats', icon: '📊', label: '仪表盘' },
  { key: 'players', icon: '👤', label: '玩家' },
  { key: 'pokedex', icon: '📖', label: '图鉴' },
  { key: 'skills', icon: '⚔', label: '技能' },
  { key: 'items', icon: '🛒', label: '市集道具' },
  { key: 'gyms', icon: '🗺', label: '道馆地区' },
  { key: 'lore', icon: '📚', label: '资料库' },
  { key: 'announcements', icon: '📢', label: '公告' },
  { key: 'logs', icon: '📜', label: '日志' }
]
const tab = ref('stats')

// 各模块数据
const stats = ref({})
const players = ref([])
const dexList = ref([])
const skills = ref([])
const items = ref([])
const gyms = ref([])
const regions = ref([])
const chapters = ref([])
const anns = ref([])
const logs = ref([])

const categories = ['一般', '火', '水', '草', '电', '冰', '格斗', '毒', '地面', '飞行', '超能力', '虫', '岩石', '幽灵', '龙', '恶', '钢', '妖精']
const levels = ['普通', '稀有', '史诗', '传说']
const regionNames = ['关都', '城都', '丰缘', '神奥', '合众', '卡洛斯', '阿罗拉', '伽勒尔', '帕底亚']

// 公告
const annText = ref('')
const annType = ref('system')

// 图鉴弹窗
const dialog = ref(false)
const editing = ref(false)
const emptyForm = () => ({ id: null, number: '', name: '', name_en: '', classification: '', category: '一般', category2: '', level: '普通', height: '', weight: '', image: '/pokemon/025.png', description: '' })
const form = ref(emptyForm())

// 技能弹窗
const skillDlg = ref(false)
const emptySkill = () => ({ id: null, name: '', type: '一般', category: '物理', power: 0, accuracy: 100, pp: 10, effect: '' })
const skillForm = ref(emptySkill())

// 道具弹窗
const itemDlg = ref(false)
const emptyItem = () => ({ id: null, name: '', category: '精灵球', price: 0, mult: 0, effect: '', enabled: 1, sort: 1 })
const itemForm = ref(emptyItem())

// 道馆弹窗
const gymDlg = ref(false)
const emptyGym = () => ({ id: null, region: '关都', localId: 1, name: '', leader: '', type: '一般', badge: '', city: '', difficulty: 1, hp: 100, intro: '', team: '', move: '' })
const gymForm = ref(emptyGym())

// 资料库弹窗
const chapterDlg = ref(false)
const emptyChapter = () => ({ id: null, name: '', region: '关都', sort: 1, years: '', tagline: '', narration: '' })
const chapterForm = ref(emptyChapter())

// 玩家详情 / 发放
const detail = ref(null)
const grant = ref(null)
const grantKind = ref('coins')
const grantName = ref('精灵球')
const grantQty = ref(1)

const bagHas = computed(() => {
  if (!detail.value) return false
  const balls = Object.values(detail.value.balls || {}).some(v => v > 0)
  const items = Object.values(detail.value.bagItems || {}).some(v => v > 0)
  return balls || items
})

function fmt(t) { return t ? String(t).replace('T', ' ').slice(0, 16) : '—' }
function logout() { sessionStorage.removeItem('pokemon_user'); router.push('/admin-login') }

async function switchTab(key) {
  tab.value = key
  if (key === 'stats') stats.value = (await adminGame.stats()) || {}
  if (key === 'players') players.value = (await adminGame.players()) || []
  if (key === 'pokedex') { const r = await pokemonList(); dexList.value = r.code === 200 ? r.data : [] }
  if (key === 'skills') skills.value = (await adminGame.skills()) || []
  if (key === 'items') items.value = (await adminGame.items()) || []
  if (key === 'gyms') { gyms.value = (await adminGame.gyms()) || []; regions.value = (await adminGame.regions()) || [] }
  if (key === 'lore') chapters.value = (await adminGame.chapters()) || []
  if (key === 'announcements') anns.value = (await adminGame.announcements()) || []
  if (key === 'logs') logs.value = (await adminGame.logs()) || []
}

// ===== 玩家 =====
async function openDetail(p) { detail.value = (await adminGame.playerDetail(p.id)) || null }
async function editCoins(p) {
  const v = prompt(`设置 ${p.username} 的金币（当前 ${p.coins}）：`, p.coins)
  if (v == null) return
  const n = Number(v)
  if (Number.isNaN(n)) return toastWarn('请输入数字')
  await adminGame.setCoins(p.id, n)
  p.coins = n
  toastOk('金币已更新')
}
async function toggleBan(p) {
  const next = p.banned ? 0 : 1
  await adminGame.setBan(p.id, next)
  p.banned = next
  toastOk(next ? '已封禁' : '已解封')
}
async function delPlayer(p) {
  if (!confirm(`确定删除玩家「${p.username}」？此操作不可恢复`)) return
  await adminGame.deletePlayer(p.id)
  players.value = players.value.filter(x => x.id !== p.id)
  toastOk('已删除')
}
function openGrant(p) { grant.value = p; grantKind.value = 'coins'; grantName.value = '精灵球'; grantQty.value = 1 }
async function doGrant() {
  if (!grant.value) return
  const qty = grantQty.value || 1
  await adminGame.grantItem(grant.value.id, grantKind.value, grantKind.value === 'coins' ? '' : grantName.value, qty)
  toastOk('已发放')
  grant.value = null
}

// ===== 图鉴 =====
function openAdd() { editing.value = false; form.value = emptyForm(); dialog.value = true }
function openEdit(p) { editing.value = true; form.value = { ...p }; dialog.value = true }
async function save() {
  if (!form.value.name || !form.value.number) return toastWarn('请填写编号和名称')
  const r = editing.value ? await pokemonUpdate(form.value) : await pokemonAdd(form.value)
  if (r.code === 200) { dialog.value = false; toastOk('已保存'); switchTab('pokedex') }
  else toastWarn(r.msg || '保存失败')
}
async function remove(p) {
  if (!confirm(`删除「${p.name}」？`)) return
  await pokemonDelete(p.id)
  toastOk('已删除')
  switchTab('pokedex')
}

// ===== 技能 =====
function openSkill(s) { skillForm.value = s ? { ...s } : emptySkill(); skillDlg.value = true }
async function saveSkill() {
  if (!skillForm.value.name) return toastWarn('请填写技能名')
  if (skillForm.value.id) await adminGame.updateSkill(skillForm.value)
  else await adminGame.addSkill(skillForm.value)
  skillDlg.value = false
  toastOk('已保存')
  switchTab('skills')
}
async function delSkill(s) {
  if (!confirm(`删除技能「${s.name}」？`)) return
  await adminGame.deleteSkill(s.id)
  toastOk('已删除')
  switchTab('skills')
}

// ===== 道具 =====
function openItem(it) { itemForm.value = it ? { ...it } : emptyItem(); itemDlg.value = true }
async function saveItem() {
  if (!itemForm.value.name) return toastWarn('请填写道具名')
  if (itemForm.value.id) await adminGame.updateItem(itemForm.value.id, itemForm.value)
  else await adminGame.addItem(itemForm.value)
  itemDlg.value = false
  toastOk('已保存')
  switchTab('items')
}
async function updateItem(it) { await adminGame.updateItem(it.id, { price: it.price }); toastOk(`${it.name} 价格已更新`) }
async function toggleItem(it) { it.enabled = it.enabled ? 0 : 1; await adminGame.updateItem(it.id, { enabled: it.enabled }); toastOk(it.enabled ? '已上架' : '已下架') }
async function delItem(it) {
  if (!confirm(`删除道具「${it.name}」？`)) return
  await adminGame.deleteItem(it.id)
  toastOk('已删除')
  switchTab('items')
}

// ===== 道馆 / 地区 =====
function openGym(g) {
  if (g) {
    let team = ''
    try { team = JSON.parse(g.teamJson || '[]').join(',') } catch (e) { team = g.teamJson || '' }
    gymForm.value = { ...g, team }
  } else {
    gymForm.value = emptyGym()
  }
  gymDlg.value = true
}
async function saveGym() {
  if (!gymForm.value.name || !gymForm.value.leader) return toastWarn('请填写道馆名和馆主')
  const payload = { ...gymForm.value }
  const teamArr = String(payload.team || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)
  payload.teamJson = JSON.stringify(teamArr)
  if (payload.id) await adminGame.updateGym(payload)
  else await adminGame.addGym(payload)
  gymDlg.value = false
  toastOk('已保存')
  switchTab('gyms')
}
async function delGym(g) {
  if (!confirm(`删除道馆「${g.name}」？`)) return
  await adminGame.deleteGym(g.id)
  toastOk('已删除')
  switchTab('gyms')
}
async function toggleRegion(r) { r.unlocked = r.unlocked ? 0 : 1; await adminGame.updateRegion(r.id, { unlocked: r.unlocked }); toastOk(r.unlocked ? '已解锁' : '已锁定') }
async function saveRegion(r) { await adminGame.updateRegion(r.id, { requireBadge: r.requireBadge }); toastOk('已更新') }

// ===== 资料库 =====
function openChapter(c) { chapterForm.value = c ? { ...c } : emptyChapter(); chapterDlg.value = true }
async function saveChapter() {
  if (!chapterForm.value.name) return toastWarn('请填写篇章名')
  if (chapterForm.value.id) await adminGame.updateChapter(chapterForm.value)
  else await adminGame.addChapter(chapterForm.value)
  chapterDlg.value = false
  toastOk('已保存')
  switchTab('lore')
}
async function delChapter(c) {
  if (!confirm(`删除篇章「${c.name}」？`)) return
  await adminGame.deleteChapter(c.id)
  toastOk('已删除')
  switchTab('lore')
}

// ===== 公告 =====
async function publishAnn() {
  if (!annText.value.trim()) return toastWarn('公告内容不能为空')
  await adminGame.publish(annText.value, annType.value)
  annText.value = ''
  toastOk('公告已发布')
  switchTab('announcements')
}
async function toggleAnn(a) { a.visible = a.visible ? 0 : 1; await adminGame.setVisible(a.id, a.visible) }
async function delAnn(a) { if (!confirm('删除该公告？')) return; await adminGame.deleteAnn(a.id); anns.value = anns.value.filter(x => x.id !== a.id) }

onMounted(() => {
  if (!user.value || user.value.role !== 0) { router.replace('/admin-login'); return }
  switchTab('stats')
})
</script>

<style scoped>
.navbar { position: sticky; top: 0; z-index: 20; background: #fff; border-bottom: 4px solid var(--poke-yellow); }
.nav-inner { max-width: 1320px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; }
.brand { font-size: 19px; font-weight: 900; color: var(--poke-red); display: flex; align-items: center; gap: 8px; }
.brand small { font-size: 11px; color: var(--poke-blue); }
.nav-user { display: flex; align-items: center; gap: 12px; }
.username { font-size: 13px; color: var(--ink-light); }

.admin-main { max-width: 1320px; margin: 0 auto; padding: 18px 20px 60px; }
.adm-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; background: #fff; border: 2px solid var(--line); border-radius: 14px; padding: 8px; }
.adm-tab { padding: 8px 14px; border-radius: 18px; background: transparent; font-size: 13px; font-weight: 700; color: var(--ink); border: none; cursor: pointer; }
.adm-tab.active { background: var(--poke-blue); color: #fff; }
.adm-tab:hover:not(.active) { background: var(--poke-blue-soft); }

.panel { background: #fff; border: 2px solid var(--line); border-radius: 16px; padding: 20px; box-shadow: var(--shadow); }
.panel h3 { font-size: 18px; margin-bottom: 14px; border-left: 5px solid var(--poke-yellow); padding-left: 10px; }
.section-head { display: flex; align-items: center; margin-bottom: 14px; }
.section-head h3 { margin-bottom: 0; }

.stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.stat-card { background: linear-gradient(135deg, var(--poke-blue-soft), #fff); border: 1px solid #d8e0ff; border-radius: 14px; padding: 18px; text-align: center; }
.stat-card b { display: block; font-size: 30px; color: var(--poke-blue); }
.stat-card span { font-size: 12.5px; color: var(--ink-light); }
.stat-card.gold { background: linear-gradient(135deg, var(--poke-orange-soft), #fff); border-color: #ffe0b8; }
.stat-card.gold b { color: var(--poke-orange-dark); }

.adm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.adm-table th { background: var(--poke-blue); color: #fff; padding: 11px 10px; text-align: left; font-weight: 700; white-space: nowrap; }
.adm-table td { padding: 9px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; }
.adm-table tr:hover td { background: #faf8f0; }
.no-cell { color: var(--poke-red); font-weight: 800; }
.nowrap { white-space: nowrap; }
.desc-cell { max-width: 240px; color: var(--ink-light); font-size: 12px; }
.pk-img { width: 36px; height: 36px; object-fit: contain; vertical-align: middle; margin-right: 6px; }
.mini-input { width: 72px; border: 1px solid var(--line); border-radius: 6px; padding: 4px 6px; font-size: 12px; }

.btn-sm-ghost { padding: 5px 11px; border-radius: 14px; background: #fff; border: 1px solid var(--line); font-size: 12px; font-weight: 700; color: var(--ink); margin-right: 5px; cursor: pointer; }
.btn-sm-ghost:hover { background: var(--poke-blue-soft); }
.btn-sm-ghost.danger { color: var(--poke-red); }
.btn-sm-ghost.danger:hover { background: #fdecec; }

.ann-publish { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.ann-input { flex: 1; min-width: 240px; border: 2px solid var(--line); border-radius: 12px; padding: 9px 12px; font-size: 13px; }
.gym-group { margin-bottom: 14px; }
.gym-group h4 { font-size: 14px; color: var(--poke-blue); margin-bottom: 6px; }
.gym-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.gym-chip { background: var(--poke-blue-soft); color: var(--poke-blue); font-size: 12px; font-weight: 700; padding: 5px 11px; border-radius: 10px; }

.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 5px; }
.field input, .field select, .field textarea { width: 100%; border: 2px solid var(--line); border-radius: 10px; padding: 9px 10px; font-size: 13px; outline: none; font-family: inherit; }
.form-row { display: flex; gap: 10px; }
.form-msg { color: var(--poke-red); font-size: 13px; margin-bottom: 10px; }

.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.modal { width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; background: #fff; border: 4px solid var(--poke-yellow); border-radius: 18px; padding: 24px; }
.modal h3 { color: var(--poke-red); margin-bottom: 18px; }
.modal h4 { color: var(--poke-blue); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
</style>
