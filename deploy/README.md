# 203 部署 / 回滚（optcg.service · 8180）

内网自玩，不挂公网、无域名。数据全在 `/data/optcg/`，代码无构建步骤（拷贝即部署）。

## 部署（本机 → 203）

```bash
KEY=/c/Users/mod/.ssh/id_rsa_compliance
# 1. 同步代码（改动后需 systemctl restart optcg 生效）
tar -C /f/claudecode/test -czf - optcg-battle \
  | ssh -i $KEY root@192.168.14.203 "mkdir -p /data/optcg && tar -C /data/optcg -xzf - --strip-components=1"

# 2. 安装 systemd 服务
scp -i $KEY /f/claudecode/test/optcg-battle/deploy/optcg.service root@192.168.14.203:/etc/systemd/system/
ssh -i $KEY root@192.168.14.203 "systemctl daemon-reload && systemctl enable --now optcg"

# 3. 验收
curl http://192.168.14.203:8180/api/health
curl -I http://192.168.14.203:8180/
```

## 日常

```bash
systemctl status optcg        # 状态
systemctl restart optcg       # 代码更新后重启（数据不丢：存档在 data/store.json）
journalctl -u optcg -n 50     # 日志
ls /data/optcg/data/backup/   # 每日快照（保留 7 份）
```

## 回滚 / 退役

- 回滚代码：重跑部署第 1 步（旧版本可从 git 或备份目录取）
- 完整退役（203 试点铁律：登记或退役，二选一）：
  ```bash
  systemctl disable --now optcg
  rm /etc/systemd/system/optcg.service && systemctl daemon-reload
  mv /data/optcg /data/_trash_optcg_$(date +%m%d)   # 留尸观察几天再删
  # 并从服务清单/port_audit 移除 8180 登记项
  ```

## 登记（部署完成即办，不可省）

- 服务清单（203 试点部署铁律）：加入 optcg/8180 条目
- `port_audit_203.sh` 晨检脚本：加入 8180 → optcg
