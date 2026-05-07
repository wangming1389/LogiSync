**Revision and Sign Off Sheet**

**Change Record**

| **Author** | **Version** | **Change reference** | **Date** |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.1 | Initialize | 29/03/2026 |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.2 | Add some use case description | 31/03/2026 |
| --- | --- | --- | --- |
| Ha Nguyen Viet Anh | 0.3 | Update use case diagram, introduction and use case description | 20/12/2023 |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.4 | Update use case diagram | 08/1/2023 |
| --- | --- | --- | --- |
| Ha Nguyen Viet Anh | 1.0 | Upload list and view description | 08/1/2023 |
| --- | --- | --- | --- |

**Reviewers**

| **Name** | **Version** | **Position** | **Date** |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.1 | Application Owner | 6/12/2023 |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.2 | Application Owner | 11/12/2023 |
| --- | --- | --- | --- |
| Pham Ngoc Quang Minh | 0.3 | Application Owner | 21/12/2023 |
| --- | --- | --- | --- |
| Ha Nguyen Viet Anh | 0.4 | Application Owner | 08/1/2023 |
| --- | --- | --- | --- |
| Ha Nguyen Viet Anh | 1.0 | Application Owner | 08/1/2023 |
| --- | --- | --- | --- |

**MỤC LỤC**

[**1\. Introduction 12**](#_heading=h.gjdgxs)

[1.1. Purpose 12](#_heading=h.30j0zll)

[1.2. Scope 12](#_heading=h.qnx4mbn9jyno)

[1.3. Intended Audiences and Document Organization 13](#_heading=h.3znysh7)

[1.4. References 13](#_heading=h.pvg6zfk3040i)

[2\. Functional Requirements 15](#_heading=)

[2.1. Use Case Description 15](#_heading=h.4d34og8)

[2.1.1. Platform 15](#_heading=h.updc5v8chlel)

[UC1: Register Workspace 15](#_heading=h.42rf2e61m5lg)

[Use Case Description 15](#_heading=h.p54l29wx4opp)

[Activities FLow 16](#_heading=h.e5hyvj9hu5h5)

[Sequence FLow 17](#_heading=h.x3kvmi10yt6d)

[Business Rules 18](#_heading=h.jmt30h5efuld)

[UC2: Approve Workspace Registration 20](#_heading=h.vdle3tmavngr)

[Use Case Description 20](#_heading=h.1uwiimcq77wy)

[Activities FLow 21](#_heading=h.ftqrwzcsb3l3)

[Sequence FLow 22](#_heading=h.c0qvdsqf45)

[Business Rules 23](#_heading=h.vt38lcc77fub)

[UC3: Reject Workspace Registration 24](#_heading=h.6qbz6gaa6cr3)

[Use Case Description 24](#_heading=h.t5a4uzuu9ycd)

[Sequence FLow 24](#_heading=h.e75rkyfstyxl)

[Activities FLow 25](#_heading=h.ammylaikg1xq)

[Business Rules 26](#_heading=h.kd43kwpnedzz)

[UC4: Suspend Workspace 27](#_heading=h.k1aikbkcdw0v)

[Use Case Description 27](#_heading=h.2jxqcztpxvro)

[Activities FLow 28](#_heading=h.d9kotamsiekb)

[Sequence FLow 29](#_heading=h.ejxpzux7t5yz)

[Business Rules 30](#_heading=h.twnt3n3zucrv)

[UC5: Revoke Workspace 31](#_heading=h.nuixpqqmhi3n)

[Use Case Description 31](#_heading=h.vi4hvx3s2vm8)

[Activities FLow 32](#_heading=h.4pnh45xhftse)

[Sequence FLow 33](#_heading=h.aiydih2kn8nw)

[Business Rules 33](#_heading=h.lxe8rta8d1bv)

[UC6: Enable Additional Roles For The Workspace 35](#_heading=h.w38juxj4asw9)

[Use Case Description 35](#_heading=h.5womjy4cf5bb)

[Activities FLow 35](#_heading=h.mr18ebhtk1u4)

[Sequence FLow 36](#_heading=h.bpw04zilzehl)

[Business Rules 37](#_heading=h.ui0k43mbpp0v)

[UC7: Login 38](#_heading=h.xip54h1grzse)

[Use Case Description 38](#_heading=h.ggdhgnd4fiiq)

[Activities FLow 38](#_heading=h.q9b2bxai72v8)

[Sequence FLow 39](#_heading=h.cf18ld94ujq7)

[Business Rules 40](#_heading=h.bk99oqutnkd2)

[UC8: Change Password 41](#_heading=h.kamouam3taun)

[Use Case Description 41](#_heading=h.w2jm19yc8t9d)

[Activities FLow 42](#_heading=h.jryh79yi61yc)

[Sequence FLow 43](#_heading=h.5oo1glf4mwq4)

[Business Rules 44](#_heading=h.uepedap1lm30)

[UC9: Forgot Password 46](#_heading=h.4q4ykb70w925)

[Use Case Description 46](#_heading=h.p0slbc2ssl79)

[Activities FLow 47](#_heading=h.gsl74s528izi)

[Sequence FLow 48](#_heading=h.f5827x6sytt1)

[Business Rules 49](#_heading=h.1gkat9j3wopp)

[UC10: Manage Session Timeot 51](#_heading=h.kcdbu58iudax)

[Use Case Description 51](#_heading=h.vcip3ut1syz1)

[Activities FLow 51](#_heading=h.in3ho2wu5ak9)

[Sequence FLow 52](#_heading=h.zcn17gj6qmiw)

[Business Rules 52](#_heading=h.poula07zhyb9)

[UC11: Manage Shared Data 54](#_heading=h.o5oid87f89rv)

[Use Case Description 54](#_heading=h.4wleivtzp7zh)

[Activities FLow 54](#_heading=h.u2eft5rxkurr)

[Sequence FLow 55](#_heading=h.rm33ozxr8lux)

[Business Rules 56](#_heading=h.q3v7le61ixcv)

[UC12: Search And Trace Audit Logs 58](#_heading=h.epu7zt8ywwb9)

[Use Case Description 58](#_heading=h.m37y8qjtmdwt)

[Activities FLow 58](#_heading=h.so2y1n9l8fcv)

[Sequence FLow 59](#_heading=h.4ukvg734cg48)

[Business Rules 60](#_heading=h.kx9wglclas1p)

[UC13: Monitor System Health 62](#_heading=h.n54glz9tlkpc)

[Use Case Description 62](#_heading=h.hmz6r6rac3dw)

[Activities FLow 63](#_heading=h.m86yycgd7xbd)

[Sequence FLow 64](#_heading=h.kxkeqz99sbao)

[Business Rules 65](#_heading=h.u2z9j6i7njxk)

[UC14: Manage Profile 66](#_heading=h.v8da1qict8uv)

[Use Case Description 66](#_heading=h.fr7iwdmwiap4)

[Activities FLow 67](#_heading=h.jrx3it2o4wxf)

[Sequence FLow 68](#_heading=h.kbzz4ns8ao17)

[Business Rules 69](#_heading=h.5o083ne85csi)

[UC15: Resolve Escalated Dispute 71](#_heading=h.tx6msawled9n)

[Use Case Description 71](#_heading=h.h5znztp5p75e)

[Activities FLow 72](#_heading=h.d6la0jd5bu1z)

[Sequence FLow 73](#_heading=h.6xraxv6xd7o9)

[Business Rules 74](#_heading=h.kn2xf7elyr0)

[UC16: View Supplier Reputation Score 76](#_heading=h.4m247t49yew9)

[Use Case Description 76](#_heading=h.eptbrjvzlkj)

[Activities FLow 77](#_heading=h.plkgjp8dxckw)

[Sequence FLow 77](#_heading=h.z61xyeuc3t04)

[Business Rules 78](#_heading=h.szzgyliwzy9c)

[UC17: View Carrier Reputation Score 80](#_heading=h.l5dyj2kiik9d)

[Use Case Description 80](#_heading=h.6n1thz18f95f)

[Activities FLow 80](#_heading=h.jo12kp11s8os)

[Sequence FLow 81](#_heading=h.cb52wdu63gro)

[Business Rules 81](#_heading=h.iu0bkhfvzkje)

[UC18: Exchange Message 83](#_heading=h.pgfl0ot32hg7)

[Use Case Description 83](#_heading=h.iwntwexdfumr)

[Activities FLow 84](#_heading=h.c40efuzhwxhh)

[Sequence FLow 85](#_heading=h.ue6aeh7nfcf7)

[Business Rules 86](#_heading=h.7becnafoiplr)

[2.1.2. Supplier 88](#_heading=h.4w3ou3ej6t3l)

[UC19: Create Catalog Category 88](#_heading=h.rtl4dqffid)

[Use Case Description 88](#_heading=h.iwhwp8byo9ph)

[Activities FLow 88](#_heading=h.er0zr9ywd0qd)

[Sequence FLow 89](#_heading=h.bjye23qm594g)

[Business Rules 90](#_heading=h.7z7jamcw4enp)

[UC20: Update Catalog Category 90](#_heading=h.ewg28gdwk6dx)

[Use Case Description 90](#_heading=h.xawnfe4u4nc4)

[Activities FLow 91](#_heading=h.rs1yav6pjzq1)

[Sequence FLow 92](#_heading=h.k9ddy91s6gv1)

[Business Rules 93](#_heading=h.ci25lxxs0ps8)

[UC21: Add Product To Catalog 93](#_heading=h.f5jdmrwm7tau)

[Use Case Description 93](#_heading=h.bfhrv6fyohdt)

[Activities FLow 94](#_heading=h.iichw57sbce2)

[Sequence FLow 95](#_heading=h.tre9ktspxxi)

[Business Rules 96](#_heading=h.92klc1lrsb9r)

[UC22: Update Product Details 96](#_heading=h.o84jgddgosxy)

[Use Case Description 96](#_heading=h.jd9heca0p65l)

[Activities FLow 97](#_heading=h.3mj4md8vplco)

[Sequence FLow 98](#_heading=h.hu6hcgpwef14)

[Business Rules 99](#_heading=h.j6ji7xwr26zu)

[UC23: Manage Product Visibility 99](#_heading=h.5h05hwjjgpe)

[Use Case Description 99](#_heading=h.zn9u0ampi3r)

[Activities FLow 100](#_heading=h.ojgb8wxllwwz)

[Sequence FLow 101](#_heading=h.tzlzjfq8i4bc)

[Business Rules 102](#_heading=h.86llekz56qxz)

[UC24: Search Catalog Items 102](#_heading=h.3dqfym4tfpas)

[Use Case Description 102](#_heading=h.9b6yxvcfouyi)

[Activities FLow 103](#_heading=h.grbophnhylr3)

[Sequence FLow 104](#_heading=h.lhmrtylo0262)

[Business Rules 105](#_heading=h.mih49wf4uy5t)

[UC25: Approve Order 105](#_heading=h.vilwbtgi47gk)

[Use Case Description 105](#_heading=h.65msws97h1y1)

[Activities FLow 106](#_heading=h.3u9wosvdssck)

[Sequence FLow 107](#_heading=h.dv0oi9c5bjdd)

[Business Rules 108](#_heading=h.g6vzukn8bxlf)

[UC26: Deny Order 108](#_heading=h.q1t660yewaf6)

[Use Case Description 108](#_heading=h.kne4lib7d4hq)

[Activities FLow 109](#_heading=h.woja7wawwpaz)

[Sequence FLow 110](#_heading=h.v9at9k7q7tkl)

[Business Rules 111](#_heading=h.jyn10ftfk2he)

[UC27: Assign Order Task 111](#_heading=h.hf5xy6o4ixt)

[Use Case Description 111](#_heading=h.pst2a3mmpfiq)

[Activities FLow 112](#_heading=h.splzn6o4c46v)

[Sequence FLow 113](#_heading=h.wx3q97eekht)

[Business Rules 114](#_heading=h.vxocrg9pbpfg)

[UC28: Reassign Order Task 114](#_heading=h.c284pnuz0rhk)

[Use Case Description 114](#_heading=h.falie9lrz43k)

[Activities FLow 115](#_heading=h.tuz5576u2crs)

[Sequence FLow 116](#_heading=h.f8mdf1qv6666)

[Business Rules 117](#_heading=h.sboofbs5c3l7)

[UC29: View My Assigned Task 118](#_heading=h.2f403lezijmt)

[Use Case Description 118](#_heading=h.tt5b1p8aa36r)

[Activities FLow 119](#_heading=h.mgaovke7170k)

[Sequence FLow 120](#_heading=h.bl4rsk61q4f6)

[Business Rules 121](#_heading=h.ri3aojtirefq)

[UC30: Negotiate Price Rounds 121](#_heading=h.ij1navniiqln)

[Use Case Description 121](#_heading=h.5244vs1rss7b)

[Activities FLow 122](#_heading=h.f6nydvy8mdcy)

[Sequence FLow 123](#_heading=h.1uo9hljyoadr)

[Business Rules 124](#_heading=h.m8kcxs4bf6y)

[UC31: Finalize Order Terms 124](#_heading=h.jckjkb9qecwu)

[Use Case Description 124](#_heading=h.nm1nh9r104hc)

[Activities FLow 125](#_heading=h.eapua19gxv8i)

[Sequence FLow 126](#_heading=h.l9spnme8dgcv)

[Business Rules 127](#_heading=h.7bt6zxoklb1u)

[UC32: Respond To RFQ 127](#_heading=h.hvjze5q8cyi5)

[Use Case Description 127](#_heading=h.33hip5cb446)

[Activities FLow 128](#_heading=h.vjthpzd8muei)

[Sequence FLow 129](#_heading=h.zc39kenrszos)

[Business Rules 130](#_heading=h.g496r210thg)

[UC33: Create Fixed Price List 131](#_heading=h.c8xy30vrlt3u)

[Use Case Description 131](#_heading=h.m59mfpmq418f)

[Activities FLow 131](#_heading=h.6cyszvigxsm2)

[Sequence FLow 132](#_heading=h.z5tyaysg02eu)

[Business Rules 133](#_heading=h.jnbumcecg4wa)

[UC34: Assign Price List To Partners 133](#_heading=h.mnirdcvkyc64)

[Use Case Description 133](#_heading=h.r9snavidbuzh)

[Activities FLow 134](#_heading=h.q8se99q9qvvu)

[Sequence FLow 135](#_heading=h.pqbczbq0k758)

[Business Rules 136](#_heading=h.d4g8dg2v2ol7)

[UC35: Set Credit Limit Per Buyer 136](#_heading=h.dthkyjqiq033)

[Use Case Description 136](#_heading=h.lwl5m82ji3v3)

[Activities FLow 137](#_heading=h.xy2vbb5b4hjh)

[Sequence FLow 138](#_heading=h.29gle2qctwai)

[Business Rules 139](#_heading=h.kayotrle7mik)

[UC36: Approve Credit Limit Bypass 139](#_heading=h.9mzfymad21gv)

[Use Case Description 139](#_heading=h.o2keonz6ncj3)

[Name 140](#_heading=h.rffvzj9wlv9x)

[Description 140](#_heading=h.rffvzj9wlv9x)

[Actor 140](#_heading=h.rffvzj9wlv9x)

[Trigger 140](#_heading=h.rffvzj9wlv9x)

[Pre-condition 140](#_heading=h.rffvzj9wlv9x)

[Post-condition 140](#_heading=h.rffvzj9wlv9x)

[Activities FLow 140](#_heading=h.i37myi31q01j)

[Sequence FLow 140](#_heading=h.6itqpzwxk93d)

[Business Rules 140](#_heading=h.qbdprjbxfb96)

[Step (Activity) 140](#_heading=h.rffvzj9wlv9x)

[BR Code 140](#_heading=h.rffvzj9wlv9x)

[Description 140](#_heading=h.rffvzj9wlv9x)

[UC37: Issue E-Warehouse Receipt 142](#_heading=h.xth12m0lvem)

[Use Case Description 142](#_heading=h.ecxlhxy77y29)

[Description 142](#_heading=h.9ewqweq87bax)

[Actor 142](#_heading=h.9ewqweq87bax)

[Trigger 142](#_heading=h.9ewqweq87bax)

[Pre-condition 142](#_heading=h.9ewqweq87bax)

[Post-condition 142](#_heading=h.9ewqweq87bax)

[Activities FLow 142](#_heading=h.tx31mprcxxis)

[Sequence FLow 142](#_heading=h.eflyadfk7m2v)

[Business Rules 142](#_heading=h.c1v92988wwxl)

[Step (Activity) 142](#_heading=h.9ewqweq87bax)

[BR Code 142](#_heading=h.9ewqweq87bax)

[Description 142](#_heading=h.9ewqweq87bax)

[UC38: Record Payment Receipt 144](#_heading=h.pzo539blnfx)

[Use Case Description 144](#_heading=h.v2ym3ggc4vb1)

[Description 144](#_heading=h.8bct3ixuj6gl)

[Actor 144](#_heading=h.8bct3ixuj6gl)

[Trigger 144](#_heading=h.8bct3ixuj6gl)

[Pre-condition 144](#_heading=h.8bct3ixuj6gl)

[Post-condition 144](#_heading=h.8bct3ixuj6gl)

[Activities FLow 144](#_heading=h.sxxpudyv95yh)

[Sequence FLow 144](#_heading=h.dfhkb57fdnzo)

[Business Rules 144](#_heading=h.qrbgkoa1kff0)

[Step (Activity) 145](#_heading=h.8bct3ixuj6gl)

[BR Code 145](#_heading=h.8bct3ixuj6gl)

[Description 145](#_heading=h.8bct3ixuj6gl)

[UC33: Clear Debt Via 3-Way Matching 146](#_heading=h.vj5jmi3h9i6e)

[Use Case Description 146](#_heading=h.fb75xewawu0s)

[Activities FLow 146](#_heading=h.kxqq5dc4i1ap)

[Sequence FLow 147](#_heading=h.21jpbmzcy1u)

[Business Rules 148](#_heading=h.o3sneu6fyc49)

[2.1.3. Carrier 149](#_heading=h.k6oloi3gomlb)

[UC40: Create Vehicle Profile 149](#_heading=h.nm3jiwbjlqct)

[Use Case Description 149](#_heading=h.m1bfuk2revoz)

[Activities FLow 149](#_heading=h.k1vyvtwf3oph)

[Sequence FLow 151](#_heading=h.2gpyu3dcdfaq)

[Business Rules 152](#_heading=h.8bjrolcerxc4)

[UC41: Update Vehicle Profile 152](#_heading=h.cll1u2bemyyl)

[Use Case Description 152](#_heading=h.utfbb0trhe62)

[Activities FLow 153](#_heading=h.8hslkq91rejd)

[Sequence FLow 154](#_heading=h.tbvlyeob5jfw)

[Business Rules 155](#_heading=h.k8s6ovb9wglm)

[UC36: Monitor Vehicle Fleet 155](#_heading=h.ptcmo6tvrkx3)

[Use Case Description 155](#_heading=h.k6wj3rr4go39)

[Activities FLow 156](#_heading=h.va74w6y83xsd)

[Sequence FLow 157](#_heading=h.ynxm4rfxy1ij)

[Business Rules 158](#_heading=h.fyywjval984j)

[UC43: Toggle Vehicle Activation 158](#_heading=h.mvev40acg4od)

[Use Case Description 158](#_heading=h.r6tmjoza1can)

[Activities FLow 159](#_heading=h.bkel5qs6ilm3)

[Sequence FLow 160](#_heading=h.ngtlk77yj178)

[Business Rules 161](#_heading=h.gs5cddhvd94r)

[UC44: Update Driver Profile 161](#_heading=h.60el8popygy9)

[Use Case Description 161](#_heading=h.v3ui4idmk94n)

[Activities FLow 162](#_heading=h.aevxj2ahvon8)

[Sequence FLow 163](#_heading=h.hg55xtq2q2sj)

[Business Rules 164](#_heading=h.z59kb4k7cpe3)

[UC45: Assign Driver To Vehicle 164](#_heading=h.ddslg1czx5p)

[Use Case Description 164](#_heading=h.aiinvzk1hgd)

[Activities FLow 165](#_heading=h.mr13s0kjuu3r)

[Sequence FLow 166](#_heading=h.y8yrzgaxl600)

[Business Rules 167](#_heading=h.n80bnjguwthy)

[UC46: Unassign Driver From Vehicle 167](#_heading=h.zdsqk94o13i6)

[Use Case Description 167](#_heading=h.suce6wepflot)

[Activities FLow 168](#_heading=h.hau9lj5m8j4g)

[Sequence FLow 169](#_heading=h.j3x4np75r3it)

[Business Rules 170](#_heading=h.sg0u16w2ag1t)

[UC47: Manage Transport Tariff 170](#_heading=h.tfnyzobam1ns)

[Use Case Description 170](#_heading=h.l5lemh236mel)

[Activities FLow 171](#_heading=h.78xkhk20uw80)

[Sequence FLow 172](#_heading=h.h3i4mcag5t5t)

[Business Rules 173](#_heading=h.jmfrouxedjs2)

[UC48: Create Initial Freight Quotation 173](#_heading=h.laqekcz28mxk)

[Use Case Description 173](#_heading=h.yeufiu9a63ai)

[Activities FLow 174](#_heading=h.sggbejlajpc3)

[Sequence FLow 175](#_heading=h.q7glgj41xy0u)

[Business Rules 176](#_heading=h.esdktkq4qvns)

[UC49: Negotiate Freight Quotation 176](#_heading=h.d5qo2w9avuwq)

[Use Case Description 176](#_heading=h.xs44c2il3now)

[Activities FLow 177](#_heading=h.n1ia17fl8m8t)

[Sequence FLow 178](#_heading=h.lhbu0epogueq)

[Business Rules 179](#_heading=h.4s47b1jpxsgu)

[UC50: Finalize & Lock Quotation 179](#_heading=h.syexazx0i68a)

[Use Case Description 179](#_heading=h.6rfooonznequ)

[Activities FLow 180](#_heading=h.o3wvp2n3ldb5)

[Sequence FLow 181](#_heading=h.bntdb3ilgm4j)

[Business Rules 182](#_heading=h.kfahfp19onbj)

[UC51: Dispatch & Issue Transport Order 182](#_heading=h.v1l8h7dqmpvd)

[Use Case Description 182](#_heading=h.qmcnuhpn4geu)

[Activities FLow 183](#_heading=h.jv494tpl7f6t)

[Sequence FLow 184](#_heading=h.kvuk052fmael)

[Business Rules 185](#_heading=h.7fdvre9foso2)

[UC52: Issue Freight Invoice 186](#_heading=h.6lvmsjfbm9ip)

[Use Case Description 186](#_heading=h.qb4wjlntk5rd)

[Activities FLow 186](#_heading=h.7h3rtfb36fwi)

[Sequence FLow 187](#_heading=h.sqbprq4i44fp)

[Business Rules 188](#_heading=h.ulx1ehtj3b7y)

[UC53: Report Shipment Incident 189](#_heading=h.fljem1b02t3g)

[Use Case Description 189](#_heading=h.qwwdl7obrqyy)

[Activities FLow 189](#_heading=h.llxjcmaln40g)

[Sequence FLow 190](#_heading=h.33eirspst3cl)

[Business Rules 191](#_heading=h.do94e6h24wx0)

[UC54: Monitor Real-time Tracking & ETA 192](#_heading=h.uta8onr8xyce)

[Use Case Description 192](#_heading=h.nxwnwrc3r0gu)

[Activities FLow 192](#_heading=h.6wv9l1lw2dsb)

[Sequence FLow 193](#_heading=h.xru3cecjrscp)

[Business Rules 194](#_heading=h.7nozul1brl1g)

[UC55: Playback Shipment Route 194](#_heading=h.9sait57wv3s3)

[Use Case Description 194](#_heading=h.ayi1cbtbel4u)

[Activities FLow 195](#_heading=h.1m7rnxhqx9n9)

[Sequence FLow 196](#_heading=h.kgiw3675lol)

[Business Rules 197](#_heading=h.h8dmwjc97ivh)

[UC56: Collect & Submit e-POD 197](#_heading=h.lllrfxf0w017)

[Use Case Description 197](#_heading=h.edc6g3gstmy4)

[Activities FLow 198](#_heading=h.lhvf4flncm2t)

[Sequence FLow 199](#_heading=h.z0kvs3igqpy1)

[Business Rules 200](#_heading=h.1aglz08eyjld)

[UC57: Submit Trip Expenses 201](#_heading=h.vgsk0ore6nxg)

[Use Case Description 201](#_heading=h.6gq08lvu9nik)

[Activities FLow 201](#_heading=h.1o7eqn3bh55j)

[Sequence FLow 202](#_heading=h.b49ivqvu763q)

[Business Rules 203](#_heading=h.d10a8e2rv47k)

[UC58: Approve Trip Expenses 203](#_heading=h.qib0fd2n4y9f)

[Use Case Description 203](#_heading=h.nv0s69k9d250)

[Activities FLow 204](#_heading=h.cyg78wdpb42r)

[Sequence FLow 205](#_heading=h.4wxdkg49u4yc)

[Business Rules 206](#_heading=h.rr7btm2j2egp)

[UC59: View Executive Dashboard 206](#_heading=h.7gtlr0tpvg5u)

[Use Case Description 206](#_heading=h.3xzkienfop6h)

[Activities FLow 207](#_heading=h.gfhkcxwylnx3)

[Sequence FLow 208](#_heading=h.p57e4hq9sg9c)

[Business Rules 209](#_heading=h.7qrlc8h8i17c)

[UC60: Export Revenue Reports 209](#_heading=h.svl6fee7fejw)

[Use Case Description 209](#_heading=h.szj35cotldt2)

[Activities FLow 210](#_heading=h.x9uw6vf4rz7)

[Sequence FLow 211](#_heading=h.c6xxid667fmo)

[Business Rules 212](#_heading=h.d2157jmubu8j)

[2.1.4. Buyer 212](#_heading=h.fxv4vqm87vnc)

[UC61: Search And Filter Products 212](#_heading=h.o8k82biccnsf)

[Use Case Description 212](#_heading=h.xydws8rbfu44)

[Name 212](#_heading=h.sdwbgl79x0qf)

[Search And Filter Products 212](#_heading=h.sdwbgl79x0qf)

[Description 213](#_heading=h.sdwbgl79x0qf)

[Actor 213](#_heading=h.sdwbgl79x0qf)

[Trigger 213](#_heading=h.sdwbgl79x0qf)

[Pre-condition 213](#_heading=h.sdwbgl79x0qf)

[Post-condition 213](#_heading=h.sdwbgl79x0qf)

[Activities FLow 213](#_heading=h.rqk4ab9yogdv)

[Sequence FLow 213](#_heading=h.g3b1uw5no7tr)

[Business Rules 213](#_heading=h.fkrowfyxipv1)

[Step (Activity) 213](#_heading=h.sdwbgl79x0qf)

[BR Code 213](#_heading=h.sdwbgl79x0qf)

[Description 213](#_heading=h.sdwbgl79x0qf)

[UC62: Add Item To RFQ List 214](#_heading=h.nl0316v04tz5)

[Use Case Description 214](#_heading=h.bd65917lapuq)

[Name 214](#_heading=h.d4tcbexak4sc)

[Add Item To RFQ List 214](#_heading=h.d4tcbexak4sc)

[Description 214](#_heading=h.d4tcbexak4sc)

[Actor 214](#_heading=h.d4tcbexak4sc)

[Trigger 214](#_heading=h.d4tcbexak4sc)

[Pre-condition 214](#_heading=h.d4tcbexak4sc)

[Post-condition 215](#_heading=h.d4tcbexak4sc)

[Activities FLow 215](#_heading=h.nhruny6wt8jf)

[Sequence FLow 215](#_heading=h.e7157bomzb2w)

[Business Rules 215](#_heading=h.ix357po4skyt)

[Step (Activity) 215](#_heading=h.d4tcbexak4sc)

[BR Code 215](#_heading=h.d4tcbexak4sc)

[Description 215](#_heading=h.d4tcbexak4sc)

[UC63: Submit Request For Quotation (RFQ) 216](#_heading=h.od4x6pll10w1)

[Use Case Description 216](#_heading=h.2opy34l9xoyb)

[Name 216](#_heading=h.oawm2zflkvyd)

[Submit Request For Quotation (RFQ) 216](#_heading=h.oawm2zflkvyd)

[Description 216](#_heading=h.oawm2zflkvyd)

[Actor 216](#_heading=h.oawm2zflkvyd)

[Trigger 216](#_heading=h.oawm2zflkvyd)

[Pre-condition 216](#_heading=h.oawm2zflkvyd)

[Post-condition 216](#_heading=h.oawm2zflkvyd)

[Activities FLow 216](#_heading=h.mirqub1pnh6j)

[Sequence FLow 216](#_heading=h.oqygz2agrj73)

[Business Rules 216](#_heading=h.hkpgsu3gzc9l)

[Step (Activity) 216](#_heading=h.oawm2zflkvyd)

[BR Code 216](#_heading=h.oawm2zflkvyd)

[Description 216](#_heading=h.oawm2zflkvyd)

[UC64: Compare & Select Supplier Quotation 217](#_heading=h.n702bfillurx)

[Use Case Description 217](#_heading=h.ub39dumqe7ia)

[Name 217](#_heading=h.exxqeh54o6qf)

[Compare & Select Supplier Quotation 217](#_heading=h.exxqeh54o6qf)

[Description 218](#_heading=h.exxqeh54o6qf)

[Actor 218](#_heading=h.exxqeh54o6qf)

[Trigger 218](#_heading=h.exxqeh54o6qf)

[Pre-condition 218](#_heading=h.exxqeh54o6qf)

[Post-condition 218](#_heading=h.exxqeh54o6qf)

[Activities FLow 218](#_heading=h.oart0ghrbcbv)

[Sequence FLow 218](#_heading=h.1amyz8q6xvvz)

[Business Rules 218](#_heading=h.j8vtxcalgmzi)

[Step (Activity) 218](#_heading=h.exxqeh54o6qf)

[BR Code 218](#_heading=h.exxqeh54o6qf)

[Description 218](#_heading=h.exxqeh54o6qf)

[UC65: Assign Order Task (Buyer) 219](#_heading=h.39h0fi55hsmb)

[Use Case Description 219](#_heading=h.kc72x4xix8rv)

[Name 219](#_heading=h.273y1gdjlmne)

[Assign Order Task (Buyer) 219](#_heading=h.273y1gdjlmne)

[Description 219](#_heading=h.273y1gdjlmne)

[Actor 219](#_heading=h.273y1gdjlmne)

[Trigger 219](#_heading=h.273y1gdjlmne)

[Pre-condition 219](#_heading=h.273y1gdjlmne)

[Post-condition 220](#_heading=h.273y1gdjlmne)

[Activities FLow 220](#_heading=h.cds0q7it7lle)

[Sequence FLow 220](#_heading=h.g1bclbvs4b61)

[Business Rules 220](#_heading=h.o8ryekk9sdli)

[Step (Activity) 220](#_heading=h.273y1gdjlmne)

[BR Code 220](#_heading=h.273y1gdjlmne)

[Description 220](#_heading=h.273y1gdjlmne)

[UC66: Reassign Order Task (Buyer) 221](#_heading=h.k79erg6f1e85)

[Use Case Description 221](#_heading=h.sc879uonl2l8)

[Name 221](#_heading=h.sc879uonl2l8)

[Reassign Order Task (Buyer) 221](#_heading=h.sc879uonl2l8)

[Description 221](#_heading=h.sc879uonl2l8)

[Actor 221](#_heading=h.sc879uonl2l8)

[Trigger 221](#_heading=h.sc879uonl2l8)

[Pre-condition 221](#_heading=h.sc879uonl2l8)

[Post-condition 221](#_heading=h.sc879uonl2l8)

[Activities FLow 221](#_heading=h.awesvr60cfvx)

[Sequence FLow 221](#_heading=h.rnvksqyz068t)

[Business Rules 222](#_heading=h.fyl722pjglmt)

[Step (Activity) 222](#_heading=h.sc879uonl2l8)

[BR Code 222](#_heading=h.sc879uonl2l8)

[Description 222](#_heading=h.sc879uonl2l8)

[UC67: View My Assigned Tasks (Buyer) 222](#_heading=h.f1tdbplwl4ns)

[Use Case Description 222](#_heading=h.sc879uonl2l8)

[Name 222](#_heading=h.49r2lywrp927)

[View My Assigned Tasks (Buyer) 222](#_heading=h.49r2lywrp927)

[Description 223](#_heading=h.49r2lywrp927)

[Actor 223](#_heading=h.49r2lywrp927)

[Trigger 223](#_heading=h.49r2lywrp927)

[Pre-condition 223](#_heading=h.49r2lywrp927)

[Post-condition 223](#_heading=h.49r2lywrp927)

[Activities FLow 223](#_heading=h.sxcw0uw8nna8)

[Sequence FLow 223](#_heading=h.n0ge7xiqe859)

[Business Rules 223](#_heading=h.k4u1jqukoo5z)

[Step (Activity) 223](#_heading=h.49r2lywrp927)

[BR Code 223](#_heading=h.49r2lywrp927)

[Description 223](#_heading=h.49r2lywrp927)

[UC68: Monitor Order Status 224](#_heading=h.x49w9k2w5g4d)

[Use Case Description 224](#_heading=h.82ixy1lubqb2)

[Activities FLow 224](#_heading=h.rtmaobb1yc9i)

[Sequence FLow 224](#_heading=h.4woy7wvlfdth)

[Business Rules 224](#_heading=h.bjwi9hny4hkk)

[UC69: Export Order History 225](#_heading=h.4y5i8b1cmmpx)

[Use Case Description 225](#_heading=h.3uk6qgnzvav8)

[Activities FLow 226](#_heading=h.aim1hcqyadtw)

[Sequence FLow 226](#_heading=h.zh3zib4qy9bb)

[Business Rules 226](#_heading=h.rl90qmh2bwim)

[UC70: View Freight Quotation Options 226](#_heading=h.3if5tw54p3kk)

[Use Case Description 226](#_heading=h.bk3dqatpgrg6)

[Activities FLow 227](#_heading=h.yoys28yep97t)

[Sequence FLow 227](#_heading=h.eqgokh4i2gsl)

[Business Rules 227](#_heading=h.4686fccx4sfm)

[UC71: Confirm Carrier Selection 228](#_heading=h.6of2zfxhwgia)

[Use Case Description 228](#_heading=h.vh1d619dk9sw)

[Name 228](#_heading=h.olcshsmdls8u)

[Confirm Carrier Selection 228](#_heading=h.olcshsmdls8u)

[Description 228](#_heading=h.olcshsmdls8u)

[Actor 228](#_heading=h.olcshsmdls8u)

[Trigger 228](#_heading=h.olcshsmdls8u)

[Pre-condition 228](#_heading=h.olcshsmdls8u)

[Post-condition 228](#_heading=h.olcshsmdls8u)

[Activities FLow 228](#_heading=h.zi6jc2987etr)

[Sequence FLow 228](#_heading=h.b0agmf6fse10)

[Business Rules 228](#_heading=h.x2tzxmcjtgdu)

[Step (Activity) 228](#_heading=h.olcshsmdls8u)

[BR Code 228](#_heading=h.olcshsmdls8u)

[Description 228](#_heading=h.olcshsmdls8u)

[UC72: Review e-POD Evidence 230](#_heading=h.wtadsrsr7qms)

[Use Case Description 230](#_heading=h.5t2wbkbzu3hv)

[Name 230](#_heading=h.vfgwhevbdzmw)

[Review e-POD Evidence 230](#_heading=h.vfgwhevbdzmw)

[Description 230](#_heading=h.vfgwhevbdzmw)

[Actor 230](#_heading=h.vfgwhevbdzmw)

[Trigger 230](#_heading=h.vfgwhevbdzmw)

[Pre-condition 230](#_heading=h.vfgwhevbdzmw)

[Post-condition 230](#_heading=h.vfgwhevbdzmw)

[Activities FLow 230](#_heading=h.4jl2hqmwbget)

[Sequence FLow 230](#_heading=h.xw51jftnk091)

[Business Rules 230](#_heading=h.11qlvll248t6)

[Step (Activity) 230](#_heading=h.vfgwhevbdzmw)

[BR Code 230](#_heading=h.vfgwhevbdzmw)

[Description 230](#_heading=h.vfgwhevbdzmw)

[UC73: Confirm Goods Receipt 231](#_heading=h.imepcrrwmcna)

[Use Case Description 231](#_heading=h.l00acz7d8ntj)

[Name 231](#_heading=h.40g9qki7wkb2)

[Confirm Goods Receipt 231](#_heading=h.40g9qki7wkb2)

[Description 231](#_heading=h.40g9qki7wkb2)

[Actor 231](#_heading=h.40g9qki7wkb2)

[Trigger 231](#_heading=h.40g9qki7wkb2)

[Pre-condition 231](#_heading=h.40g9qki7wkb2)

[Post-condition 231](#_heading=h.40g9qki7wkb2)

[Activities FLow 232](#_heading=h.q07ir0kb6umy)

[Sequence FLow 232](#_heading=h.vumiwm3s68v0)

[Business Rules 232](#_heading=h.r5dy40ffwr6f)

[Step (Activity) 232](#_heading=h.40g9qki7wkb2)

[BR Code 232](#_heading=h.40g9qki7wkb2)

[Description 232](#_heading=h.40g9qki7wkb2)

[UC74: Execute 3-Way Matching (Buyer) 233](#_heading=h.4npqxkan96fx)

[Use Case Description 233](#_heading=h.cf2wu9qxfu5e)

[Name 233](#_heading=h.t5u6ob4i581i)

[Execute 3-Way Matching (Buyer) 233](#_heading=h.t5u6ob4i581i)

[Description 233](#_heading=h.t5u6ob4i581i)

[Actor 233](#_heading=h.t5u6ob4i581i)

[Trigger 233](#_heading=h.t5u6ob4i581i)

[Pre-condition 233](#_heading=h.t5u6ob4i581i)

[Post-condition 233](#_heading=h.t5u6ob4i581i)

[Activities FLow 233](#_heading=h.d4jvbmfrly06)

[Sequence FLow 233](#_heading=h.3xinnrwihvgm)

[Business Rules 233](#_heading=h.rsea3qdiucf7)

[Step (Activity) 233](#_heading=h.t5u6ob4i581i)

[BR Code 233](#_heading=h.t5u6ob4i581i)

[Description 233](#_heading=h.t5u6ob4i581i)

[UC75: Execute Payment 235](#_heading=h.xjvyvoegqykh)

[Use Case Description 235](#_heading=h.faimivmp1j4i)

[Activities FLow 235](#_heading=h.mzqii237ebot)

[Sequence FLow 235](#_heading=h.80jwuajq60x1)

[Business Rules 235](#_heading=h.oc5dclit1j84)

[UC76: File Formal Complaint 236](#_heading=h.p63ie747esx8)

[Use Case Description 236](#_heading=h.pg3li0gvl925)

[Activities FLow 237](#_heading=h.3c6m6z9uck6d)

[Sequence FLow 237](#_heading=h.r34l1twcw64h)

[Business Rules 237](#_heading=h.fm96nkq89osg)

[UC77: Escalate Dispute To Admin 238](#_heading=h.19vxgetgzizp)

[Use Case Description 238](#_heading=h.ds5w6mnwk9rc)

[Activities FLow 238](#_heading=h.iua83x4wkey7)

[Sequence FLow 238](#_heading=h.2l4b77w5uebi)

[Business Rules 238](#_heading=h.yueymqbu2v9x)

[2.1.5. HR 239](#_heading=h.tp4xs5cvagbl)

[UC78: Create Employee Profile & Account 239](#_heading=h.3er9bq1df4hy)

[Use Case Description 239](#_heading=h.x103i51epr8t)

[Activities FLow 240](#_heading=h.jowfydtnfaui)

[Sequence FLow 240](#_heading=h.e73x3sa5p2da)

[Business Rules 240](#_heading=h.jm1c0uixob6)

[UC79: Manage Employee Roles 241](#_heading=h.8h0qhhk5qsw1)

[Use Case Description 241](#_heading=h.isyrr84zdwgs)

[Activities FLow 241](#_heading=h.hjupltc69sq2)

[Sequence FLow 242](#_heading=h.5gwq8kb3a7yt)

[Business Rules 242](#_heading=h.gc8w6m4vlvzp)

[UC80: Deactivate Employee Account 242](#_heading=h.ahnaj31j7p19)

[Use Case Description 242](#_heading=h.trvfo1svy9wt)

[Activities FLow 243](#_heading=h.kf5sqydxdyaw)

[Sequence FLow 243](#_heading=h.7fd2ynzdw254)

[Business Rules 243](#_heading=h.5qzh0jxvlfo9)

[UC81: Reactivate Employee Account 244](#_heading=h.3l5f6pojxypz)

[Use Case Description 244](#_heading=h.cu81sivu3f8t)

[Activities FLow 244](#_heading=h.qkc7u5ag6cve)

[Sequence FLow 245](#_heading=h.otet3kq19s2)

[Business Rules 245](#_heading=h.xbm6uletbp6c)

[UC82: Monitor Employee KPI Dashboard 245](#_heading=h.vhpyv9ovtfro)

[Use Case Description 245](#_heading=h.gns44n6nbtnl)

[Activities FLow 246](#_heading=h.bd000xepiptn)

[Sequence FLow 246](#_heading=h.oqcipu44d2xh)

[Business Rules 246](#_heading=h.ffy8ahfvh7uo)

[UC83: Set Employee KPI Targets 247](#_heading=h.js6grc7vgxqg)

[Use Case Description 247](#_heading=h.dccw6ovtijnf)

[Activities FLow 247](#_heading=h.bhv6nqnbje39)

[Sequence FLow 247](#_heading=h.gy8co73d4czb)

[Business Rules 247](#_heading=h.2b7bff9wqwz)

[UC84: Update KPI Results 248](#_heading=h.xt3sgen0e6r5)

[Use Case Description 248](#_heading=h.vdgqv0qaqk0b)

[Activities FLow 248](#_heading=h.mg1538yfbuvj)

[Sequence FLow 249](#_heading=h.viufy6bwev6k)

[Business Rules 249](#_heading=h.kn412kc7lxfw)

[UC85: Track Personal KPI Progress 249](#_heading=h.x99xo6h160zs)

[Use Case Description 249](#_heading=h.tjmj4cady19k)

[Activities FLow 250](#_heading=h.9cm92ly4oa79)

[Sequence FLow 250](#_heading=h.ig3bwyapaikf)

[Business Rules 250](#_heading=h.vyjt7h6z7g0r)

[UC86: View Organizational KPI Dashboard 251](#_heading=h.6ct7txmtvplx)

[Use Case Description 251](#_heading=h.44xi8xr85zfm)

[Activities FLow 251](#_heading=h.q77etw7kv0dm)

[Sequence FLow 251](#_heading=h.y8kgpfq92s13)

[Business Rules 251](#_heading=h.r58qnz6sdlp0)

[2.1.6. Infrastructure 252](#_heading=h.l6tjxtlvlnb6)

[UC87: Broadcast System Notifications 252](#_heading=h.3rdcrjn)

[Use Case Description 252](#_heading=h.qyjwn5j9yarr)

[Activities FLow 252](#_heading=h.qioj7jilpf78)

[Sequence FLow 253](#_heading=h.xwcp34qu55ir)

[Business Rules 253](#_heading=h.kz5umrh4ow8d)

[UC88: Upload & Secure File Storage 253](#_heading=h.xx13iycfapi)

[Use Case Description 253](#_heading=h.46qj9a3tf0sw)

[Activities FLow 254](#_heading=h.boozy3xj6hl)

[Sequence FLow 254](#_heading=h.c30d076tdjj)

[Business Rules 254](#_heading=h.mzfziu7o6wwb)

[UC89: Generate Secure Signed URL 255](#_heading=h.hjo39fhub0hm)

[Use Case Description 255](#_heading=h.4odmbjp3l37f)

[Activities FLow 256](#_heading=h.5ajlfbh9im46)

[Sequence FLow 256](#_heading=h.z19jvwlzdt1o)

[Business Rules 256](#_heading=h.zddscqjmjclw)

[**2.2. List Description 257**](#_heading=h.26in1rg)

[**2.3. View Description 257**](#_heading=h.35nkun2)

[**3\. Non-functional Requirements 257**](#_heading=h.44sinio)

[3.1. User Access and Security 257](#_heading=h.2jxsxqh)

[3.2. Performance Requirements 258](#_heading=h.4i7ojhp)

[3.3. Implementation Requirements 259](#_heading=h.2xcytpi)

[**4\. Appendixes 259**](#_heading=h.41mghml)

[Glossary 259](#_heading=h.2grqrue)

[Messages 260](#_heading=h.3fwokq0)

[Issues List 265](#_heading=h.28h4qwu)

# Introduction

## Purpose

The document serves as the Software Requirement Specification (SRS) and Detailed Design Document for the Logistics Operations Support System. It formalizes detailed requirements and architectural considerations to guide the entire development lifecycle. As an essential reference for the development team, it provides a comprehensive roadmap of application functionalities - to facilitate efficient task allocation and system implementation strategies.

The primary objective of this document is to outline the business requirements and establish a clear design framework for the system. It acts as a foundational guide for all stakeholders, ensuring a unified understanding of project goals, specialized business processes (such as shipment management, price negotiation, and 3-way matching), and overall project expectations.

## Scope

The scope of this document encompasses logistics market research findings, evaluation of existing software solutions, and in-depth analysis of relevant legal regulations. It defines functional requirements across six core domains: Platform, Supplier, Carrier, Buyer, HR, and Infrastructure.

The system is engineered for strict compliance with rigorous legal frameworks, including the Luật Bảo vệ Dữ liệu Cá nhân (Law on Personal Data Protection - No. 91/2025), Nghị định 356/2025 (Decree on Audit Logging - No. 356/2025), and Thông tư 32/2025 (Circular on Electronic Invoices - No. 32/2025).

From a technical perspective, the system adopts a Modular Monolith Architecture in its initial phase to ensure a lean and manageable structure, while maintaining clear business logic separation between modules.

## Intended Audiences and Document Organization

This document defines the roles and responsibilities of the specialized teams involved in the project

- Development team: Responsible for translating business requirements into high-quality software, performing detailed technical design, and executing unit/integration testing.
- Document team: Develops comprehensive user manuals and technical guides to ensure efficient system adoption and user onboarding.
- User Acceptance Testing (UAT) team: Validates the application’s functionality and usability from the end-user’s perspective to ensure it meets all business needs.

The document is organized as follows:

- Introduction: Provides a general overview of the document and the scope of research.
- Functional requirements: Detailed descriptions of business operations across the six identified domains.
- Non-functional requirements: Specifications regarding security standards, user interface (UI/UX), and system performance.
- Other requirements: Specific requirements for storage management and system audit logging functionality.
- Appendices: Supplementary data, supporting information, and additional legal references.

## References

| **#** | **Title** | **Version** | **File Name / Link** | **Description** |
| --- | --- | --- | --- | --- |
| 1   | Luật Bảo vệ Dữ liệu cá nhân (Số 91/2025)<br><br>_(Law on Personal Data Protection - No. 91/2025)_ | 2025 | [Luat_91_2025.pdf](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/7/91qh.signed.pdf) | Regulations on user data processing, driver profiles, and Workspace security compliance. |
| --- | --- | --- | --- | --- |
| 2   | Nghị định về Nhật ký kiểm toán (Số 356/2025)<br><br>_(Decree on Audit Logging - No. 356/2025)_ | 2025 | [ND_356_2025.pdf](https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/01/356-nd.signed.pdf) | Legal framework for immutable system logging and administrative action monitoring. |
| --- | --- | --- | --- | --- |
| 3   | Thông tư về Hóa đơn điện tử (Số 32/2025)<br><br>_(Circular on Electronic Invoices - No. 32/2025)_ | 2025 | [TT_32_2025.pdf](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/6/32-btc.pdf) | Standards for electronic invoice formats regarding goods and freight transport documents. |
| --- | --- | --- | --- | --- |
| 4   | Nghị định về Quản lý vận tải (Số 10/2020/NĐ-CP)<br><br>_(Decree on Transport Management - No. 10/2020/ND-CP)_ | 2020 | [ND_10_2020.pdf](https://datafiles.chinhphu.vn/cpp/files/vbpq/2020/01/10.signed.pdf) | Regulations on electronic transport orders and vehicle journey monitoring. |
| --- | --- | --- | --- | --- |
| 5   | Luật Giao dịch điện tử (Số 20/2023/QH15)<br><br>_(Law on Electronic Transactions - No. 20/2023/QH15)_ | 2023 | [Luat_GDDT_20_2023.pdf](https://datafiles.chinhphu.vn/cpp/files/vbpq/2023/8/luat20-2023-qh15..pdf) | Legal basis for Electronic Proof of Delivery (e-POD) and the validity of digital signatures. |
| --- | --- | --- | --- | --- |

# Functional Requirements

## Use Case Description

### Platform

#### UC1: Register Workspace

##### Use Case Description

| **Name** | **Register Workspace** |
| --- | --- |
| **Description** | This use case allows a Company Admin to submit a two-step registration form. The system performs real-time frontend validation, backend identity uniqueness checks, handles document uploads, and ensures compliance with Decree 91/2025 regarding electronic audit trails. |
| --- | --- |
| **Actor** | Company Admin |
| --- | --- |
| **Trigger** | Admin clicks the "Register Workspace" button on the onboarding landing page. |
| --- | --- |
| **Pre-condition** | System is operational. User has a stable internet connection. No active session for this specific Tax ID exists in the pending queue. |
| --- | --- |
| **Post-condition** | Workspace record is created. Password is encrypted. Audit logs are stored. Confirmation email is dispatched in < 30s. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (4) | BR-01 | **Tax ID Validation (Frontend - onBlur):**<br><br>When \[txtTaxID\] loses focus, the system triggers validateTaxID().<br><br>Logic: IF NOT Regex.Match(\[txtTaxID\].Text, "^\[0-9\]{10,13}$")<br><br>Action: Set border: 2px solid #FF0000, display MSG-1, and disable \[btnNext\].<br><br>Performance: Latency must be < 100ms. |
| --- | --- | --- |
| (6.1) | BR-02 | **Role Selection Rule:**<br><br>The system checks the selectedRoles\[\] array.<br><br>Logic: IF selectedRoles.length == 0<br><br>Action: Disable \[btnSubmit\] and show tooltip: "At least one role must be assigned to the admin." |
| --- | --- | --- |
| (6.1) | BR-03 | **Password Complexity Rule:**<br><br>System validates \[txtPassword\].Text.<br><br>Logic: Must match ^(?=.\*\[A-Z\])(?=.\*\[!@#$&\*\])(?=.\*\[0-9\])(?=.\*\[a-z\]).{8,}$.<br><br>Action: Update \[PasswordStrengthMeter\] real-time. If invalid on submit, show MSG-2. |
| --- | --- | --- |
| (6.1) | BR-04 | **File Upload Constraints:**<br><br>System validates \[uplLegalDocs\].<br><br>Constraint 1: Format must be in \['.pdf', '.jpg', '.png'\].<br><br>Constraint 2: File size max_limit = 5242880 bytes (5MB).<br><br>Action: If file.size > max_limit, call showToastNotification("File too large"). |
| --- | --- | --- |
| (8) | BR-05 | **Identity Uniqueness Query (Backend):**<br><br>System executes SQL:<br><br>"SELECT COUNT(\*) FROM Workspaces WHERE tax_id = ? OR admin_email = ?"<br><br>Action: If result > 0, return 409 Conflict and move to step (8.1) to display MSG-3. |
| --- | --- | --- |
| (9) | BR-06 | **Encryption Rule (SecurityService):**<br><br>System calls bcrypt.hash(raw_password, rounds=12).<br><br>Requirement: The raw password must be purged from memory immediately after the password_hash is generated. |
| --- | --- | --- |
| (11) | BR-07 | **Legal Compliance (Decree 91/2025):**<br><br>Inside the DB Transaction, system must execute:<br><br>INSERT INTO Audit_Logs (action, ip_address, timestamp, user_agent, terms_version)<br><br>VALUES ('WS_REG', @IP, UTC_TIMESTAMP, @UA, 'v2026_Q1'). |
| --- | --- | --- |
| (12) | BR-08 | **Notification SLA:**<br><br>System queues triggerEmail(WS_WELCOME_TEMPLATE).<br><br>Requirement: Total execution time from POST request to 201 Created response (including email queuing) must be < 30s, trigger MSG-4. |
| --- | --- | --- |

#### 

#### UC2: Approve Workspace Registration

##### Use Case Description

| **Name** | **Approve Workspace Registration** |
| --- | --- |
| **Description** | This use case allows a Platform Admin to review and approve pending workspace applications. Upon approval, the system updates the workspace status, records an audit trail for compliance, and notifies the Company Admin. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Platform Admin navigates to the "Pending Approvals" dashboard. |
| --- | --- |
| **Pre-condition** | Platform Admin is authenticated with role: 'PLATFORM_ADMIN'. At least one workspace exists with status: 'PENDING'. |
| --- | --- |
| **Post-condition** | Workspace status is updated to 'ACTIVE'. Audit log entry is created. Company Admin receives an activation email in < 1 min. |
| --- | --- |

##### 

##### Activities FLow

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-09 | **Data Retrieval Logic:**<br><br>System fetches records using: SELECT w.\*, u.email FROM Workspaces w JOIN Users u ON w.id = u.workspace_id WHERE w.status = 'PENDING'. |
| --- | --- | --- |
| (3) | BR-10 | **Approval Confirmation:**<br><br>System must intercept the click event and call ModalService.showConfirm(MSG-5) before sending the API request. |
| --- | --- | --- |
| (7) | BR-11 | **State Machine Transition & Race Condition:**<br><br>Execute: UPDATE Workspaces SET status = 'ACTIVE', approved_at = UTC_TIMESTAMP, approved_by = @AdminID WHERE id = @TargetID AND status = 'PENDING'.<br><br>Logic: IF ROWS_AFFECTED == 0 (meaning status was already changed by another admin), trigger MSG-7 and abort. |
| --- | --- | --- |
| (8) | BR-12 | **Enhanced Audit Logging:**<br><br>Record into System_Audit table:<br><br>{ action: 'APPROVE_WORKSPACE', actor: @AdminID, target: @WS_ID, metadata: {ip: @IP, timestamp: @TS, geo: @Location} }. |
| --- | --- | --- |
| (9) | BR-13 | **Access Granting Rule:**<br><br>System automatically updates the Users table associated with the workspace: UPDATE Users SET is_active = 1, last_status_change = UTC_TIMESTAMP WHERE workspace_id = @WS_ID AND role = 'COMPANY_ADMIN'. |
| --- | --- | --- |
| (10) | BR-14 | **Notification SLA & Success Feedback:**<br><br>1\. System pushes an EVENT_WS_ACTIVATED to the Message Broker (SLA: deliver email in < 1 minute).<br><br>2\. Upon successful API response from Step (7), the system must trigger MSG-6. |
| --- | --- | --- |

#### 

#### UC3: Reject Workspace Registration

##### Use Case Description

| **Name** | **Reject Workspace Registration** |
| --- | --- |
| **Description** | This use case allows a Platform Admin to decline a pending workspace application. The Admin must provide a specific reason for rejection, which is then logged for audit purposes and sent to the applicant. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin selects a pending workspace record and clicks the "Reject" button. |
| --- | --- |
| **Pre-condition** | Platform Admin is logged in. Workspace exists with status = 'PENDING'. |
| --- | --- |
| **Post-condition** | Workspace status is updated to 'REJECTED'. Rejection reason is stored. Audit log is generated. Applicant receives a rejection email within 1 minute. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (5) | BR-15 | **Input Mandatory Rule:**<br><br>The \[txtRejectionReason\] field must not be null or empty.<br><br>Logic: IF String.IsNullOrWhiteSpace(reason) THEN disable \[btnConfirmReject\] and show MSG-8. |
| --- | --- | --- |
| (7) | BR-16 | **Confirmation & State Transition (Terminal):**<br><br>1\. Before execution, the system must trigger MSG-9 for final admin confirmation.<br><br>2\. Logic: IF Confirmed THEN Execute: UPDATE Workspaces SET status = 'REJECTED', rejection_reason = @reason, updated_at = UTC_TIMESTAMP WHERE id = @id.<br><br>Note: Unlike 'Suspended', 'Rejected' is a terminal state for this registration GUID. |
| --- | --- | --- |
| (8) | BR-17 | **Compliance Auditing:**<br><br>Record into Audit_Logs:<br><br>{ action: 'REJECT_WORKSPACE', actor: @AdminID, target: @WS_ID, reason: @reason, ip: @IP }. |
| --- | --- | --- |
| (9) | BR-18 | **Data Retention Policy:**<br><br>The system retains the rejected record for 90 days (per standard policy) before archival to prevent immediate re-registration with the same Tax ID if the rejection was due to fraud. |
| --- | --- | --- |
| (10) | BR-19 | **Notification SLA & Success Feedback:**<br><br>1\. System triggers MailService.send(TEMPLATE_REJECT, payload: {reason: @reason}).<br><br>2\. Constraint: Delivery to mail queue must be < 1 minute.<br><br>3\. Action: Upon successful completion of the flow, trigger MSG-10. |
| --- | --- | --- |

#### 

#### UC4: Suspend Workspace

##### Use Case Description

| **Name** | **Suspend Workspace** |
| --- | --- |
| **Description** | This use case allows a Platform Admin to temporarily revoke access for an entire workspace. The system must invalidate all active sessions for that specific tenant within seconds and block future login attempts while ensuring zero impact on other tenants (multi-tenancy isolation). |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin selects an 'ACTIVE' workspace from the management dashboard and clicks the "Suspend" button. |
| --- | --- |
| **Pre-condition** | Platform Admin is authenticated. The target workspace has an 'ACTIVE' status. |
| --- | --- |
| **Post-condition** | Workspace status is 'SUSPENDED'. All tenant sessions are invalidated. Audit logs are persisted. Other tenants remain fully operational. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (3) | BR-20 | **Confirmation & State Transition Logic:**<br><br>1\. Before sending the request, the system must trigger MSG-11 for final admin confirmation.<br><br>2\. Logic: IF Confirmed THEN Execute: UPDATE Workspaces SET status = 'SUSPENDED', suspended_at = UTC_TIMESTAMP WHERE id = @TargetID AND status = 'ACTIVE'.<br><br>3\. System must use a row-level lock to ensure atomicity. |
| --- | --- | --- |
| (4) | BR-21 | **Tenant Session Invalidation (Force Logout):**<br><br>System must broadcast a "Session Invalidation" event to the Auth Service.<br><br>Logic: Redis.DEL("sessions:tenant:{workspace_id}:\*") or add workspace_id to a JWT Blacklist cluster.<br><br>Availability SLA: All active sessions must be terminated in < 5 seconds. |
| --- | --- | --- |
| (5) | BR-22 | **Multi-tenancy Isolation Rule (Security):**<br><br>The suspension query must include a strict WHERE tenant_id = @id clause.<br><br>Security Constraint: System must verify that no sessions belonging to tenant_id != @id are affected during the Redis/DB sweep. |
| --- | --- | --- |
| (9) | BR-23 | **Login Restriction Rule:**<br><br>During the "Sign In" use case, the Auth query must be updated to:<br><br>SELECT ... FROM Users u JOIN Workspaces w ON u.workspace_id = w.id WHERE u.email = ? AND w.status = 'ACTIVE'.<br><br>If w.status == 'SUSPENDED', return MSG-13. |
| --- | --- | --- |
| (10) | BR-24 | **Administrative Audit Logging & Success Feedback:**<br><br>1\. Record into Audit_Logs: { action: 'SUSPEND_WORKSPACE', actor: @AdminID, target_tenant: @WS_ID, ip: @IP, timestamp: @TS }.<br><br>2\. Action: Upon successful completion of the persistence and invalidation flow, trigger MSG-12. |
| --- | --- | --- |

#### UC5: Revoke Workspace

##### Use Case Description

| **Name** | **Revoke Workspace** |
| --- | --- |
| **Description** | This use case allows a Platform Admin to permanently revoke a workspace's access. It includes a safety check for active business operations (shipments) and requires a high-friction confirmation (typing the company name) to prevent accidental data loss. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin selects a workspace and clicks the "Revoke" button. |
| --- | --- |
| **Pre-condition** | Platform Admin is authenticated with PLATFORM_ADMIN privileges. Target workspace exists in any status other than 'REVOKED'. |
| --- | --- |
| **Post-condition** | Workspace status is set to 'REVOKED'. All active sessions are killed within 5 seconds. Access is permanently barred. Audit trail is recorded. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-25 | **Active Operations Check (Safety):**<br><br>System queries: SELECT COUNT(\*) FROM Shipments WHERE workspace_id = @id AND status NOT IN ('DELIVERED', 'CANCELLED').<br><br>Logic: If Count > 0, system must display a Yellow Warning Banner (MSG-14) detailing the risk. |
| --- | --- | --- |
| (6) | BR-26 | **High-Friction Confirmation & Validation:**<br><br>1\. The system displays MSG-15 to prompt the user for manual name entry.<br><br>2\. The \[btnConfirmRevoke\] is disabled by default.<br><br>Logic: IF txtInputName.Text !== Workspace.Name THEN trigger MSG-17 and keepDisabled().<br><br>Validation: Case-sensitive exact string match required to enable the button. |
| --- | --- | --- |
| (8) | BR-27 | **Permanent Status Transition:**<br><br>Execute: UPDATE Workspaces SET status = 'REVOKED', revoked_at = UTC_TIMESTAMP, revoked_by = @AdminID WHERE id = @id.<br><br>Note: This status cannot be reverted through the standard UI. |
| --- | --- | --- |
| (9) | BR-28 | **Immediate Session Termination (SLA):**<br><br>System broadcasts a high-priority kill signal to the Gateway/Auth Layer.<br><br>Availability SLA: All JWT/OAuth sessions must be invalidated across all nodes in < 5 seconds. |
| --- | --- | --- |
| (11) | BR-29 | **Audit Logging (Immutable):**<br><br>Record into Audit_Logs:<br><br>{ event: 'WORKSPACE_REVOKED', actor: @AdminID, target: @WS_ID, confirmation_method: 'NAME_MATCH', ip: @IP }. |
| --- | --- | --- |
| (12) | BR-30 | Data Isolation & Success Feedback:<br><br>1\. All API Middleware must intercept requests with a REVOKED workspace ID and return 410 Gone.<br><br>2\. Action: Upon successful completion of the revocation flow, trigger MSG-16. |
| --- | --- | --- |

#### 

#### **UC6: Enable** A**dditional** R**oles** F**or** T**he Workspace**

##### Use Case Description

| **Name** | **Enable Additional Roles For The Workspace** |
| --- | --- |
| **Description** | This use case allows a Company Admin to expand the capabilities of their workspace by enabling additional system roles (e.g., Fleet Manager, Warehouse Supervisor). It ensures strict API-level authorization and high-performance menu updates via cache synchronization. |
| --- | --- |
| **Actor** | Company Admin |
| --- | --- |
| **Trigger** | Admin navigates to "Workspace Settings" and clicks on "Role Management" or "Feature Enablement." |
| --- | --- |
| **Pre-condition** | Workspace status is 'ACTIVE'. Actor is authenticated as 'COMPANY_ADMIN'. |
| --- | --- |
| **Post-condition** | Workspace role configuration is updated. System cache is refreshed. New menus are visible on next page load. Audit trail is recorded. |
| --- | --- |

##### Activities FLow

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1), (3) | BR-31 | **Strict Authorization (API Layer):**<br><br>The backend must intercept the request and verify permissions.<br><br>Logic: IF user.role !== 'COMPANY_ADMIN' OR user.ws_id !== target_ws_id.<br><br>Action: RETURN 403 Forbidden and trigger MSG-20. |
| --- | --- | --- |
| (2) | BR-32 | **Role Availability Query:**<br><br>System fetches roles from System_Roles table that are not currently active for the workspace:<br><br>SELECT \* FROM System_Roles WHERE role_id NOT IN (SELECT role_id FROM Workspace_Enabled_Roles WHERE ws_id = @id). |
| --- | --- | --- |
| (7) | BR-33 | **Confirmation & Data Update Logic:**<br><br>1\. Before execution, the system must trigger MSG-18 for final confirmation of the selected roles.<br><br>2\. Logic: IF Confirmed THEN Perform a batch insert:<br><br>INSERT INTO Workspace_Enabled_Roles (workspace_id, role_id, enabled_at, enabled_by) VALUES (@ws_id, @role_id, UTC_TIMESTAMP, @AdminID). |
| --- | --- | --- |
| (8) | BR-34 | **Audit Logging:**<br><br>Record the change:<br><br>{ event: 'ENABLE_ROLES', actor: @AdminID, workspace: @ws_id, added_roles: \[@role_ids\], timestamp: @TS }. |
| --- | --- | --- |
| (9) | BR-35 | **Cache Invalidation & Performance:**<br><br>System triggers a cache update for the workspace configuration.<br><br>Logic: Cache.set("ws_config:{id}:roles", updated_list, ttl=3600).<br><br>Performance SLA: Menu items related to new roles must appear in < 1 second on next page load. |
| --- | --- | --- |
| (10) | BR-36 | **Tier Enforcement & Success Feedback:**<br><br>1\. System must verify subscription tier: IF role.required_tier > workspace.subscription_tier THEN trigger MSG-21 and abort.<br><br>2\. Action: Upon successful completion of the entire flow, trigger MSG-19. |
| --- | --- | --- |

#### **UC7: Login**

##### Use Case Description

| **Name** | **Login** |
| --- | --- |
| **Description** | This use case allows users (Staff, Company Admin, or Platform Admin) to authenticate and access their specific workspace. It includes brute-force protection (account locking) and a role-selection step for users with multiple assigned roles. |
| --- | --- |
| **Actor** | Authenticated User (Staff, Company Admin, Platform Admin) |
| --- | --- |
| **Trigger** | User navigates to the login page and enters credentials. |
| --- | --- |
| **Pre-condition** | User has an existing account with status: 'ACTIVE'. The associated workspace must not be SUSPENDED or REVOKED. |
| --- | --- |
| **Post-condition** | User is authenticated via JWT. Session is established. User is redirected to their specific dashboard or a role-selection screen. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (3) | BR-37 | **Lockout Check:**<br><br>Before credential validation, the system verifies the account's lock status. IF lockout_until > UTC_TIMESTAMP, return MSG-23 containing a real-time countdown timer. |
| --- | --- | --- |
| (4) | BR-38 | **Credential Verification:**<br><br>1\. System invokes bcrypt.compare(password, user.password_hash).<br><br>2\. Action: Upon failure, increment failed_login_attempts in the Database and return MSG-22. |
| --- | --- | --- |
| (5) | BR-39 | **Account Locking Logic (Security):**<br><br>IF failed_login_attempts >= 5:<br><br>1\. Set lockout_until = UTC_TIMESTAMP + 15 minutes.<br><br>2\. Return MSG-23 with a 15-minute countdown. |
| --- | --- | --- |
| (6) | BR-40 | **Workspace Status Check:**<br><br>System must verify Workspace.status == 'ACTIVE'.<br><br>If the workspace is SUSPENDED or REVOKED, deny login and show MSG-24. |
| --- | --- | --- |
| (7) | BR-41 | **Multi-role Selection Logic:**<br><br>System queries user_roles for the account.<br><br>IF Count(roles) > 1 THEN redirect to /select-role view.<br><br>ELSE proceed directly to the default dashboard. |
| --- | --- | --- |
| (8) | BR-42 | **Performance, JWT & Success Feedback:**<br><br>1\. System generates JWT containing user_id, workspace_id, and role.<br><br>2\. Action: Upon successful authentication and before redirection, trigger MSG-25.<br><br>3\. SLA: Redirect to the appropriate dashboard must occur in < 2 seconds. |
| --- | --- | --- |

##### 

#### 

#### **UC8:** Change P**assword**

##### Use Case Description

| **Name** | **Change Password** |
| --- | --- |
| **Description** | This use case allows an authenticated user to update their account password. To ensure security, the user must verify their current password, and upon success, the system purges all other active sessions to prevent unauthorized access from other devices. |
| --- | --- |
| **Actor** | Authenticated User (Staff, Company Admin, Platform Admin) |
| --- | --- |
| **Trigger** | User navigates to "Profile Settings" or "Security" and clicks "Change Password." |
| --- | --- |
| **Pre-condition** | User is successfully authenticated and has an active session. |
| --- | --- |
| **Post-condition** | Password is re-hashed and updated in the DB. All other sessions are invalidated in < 1s. Audit log is recorded. User remains logged in with the updated credentials or is prompted to re-login. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-43 | **Displaying Rules:** System renders a form with three fields: \[txtCurrentPassword\], \[txtNewPassword\], and \[txtConfirmPassword\]. All fields must use password masking. |
| --- | --- | --- |
| (4) | BR-44 | **Frontend Match Validation:**<br><br>Logic: IF txtNewPassword.Text !== txtConfirmPassword.Text<br><br>Action: Display MSG-28 and disable \[btnSubmit\]. |
| --- | --- | --- |
| (4) | BR-45 | **New Password Complexity:**<br><br>Logic: Must match regex ^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\d)(?=.\*\[@$!%\*?&\])\[A-Za-z\\d@$!%\*?&\]{8,}$.<br><br>Action: If fail, display MSG-29. |
| --- | --- | --- |
| (6) | BR-46 | **Current Password Verification (Critical):**<br><br>The backend must verify the existing password before allowing any change.<br><br>Logic: bcrypt.compare(txtCurrentPassword.Text, user.password_hash).<br><br>Action: If verification fails, return MSG-27. |
| --- | --- | --- |
| (7) | BR-47 | **Identity Avoidance Rule:**<br><br>Logic: IF bcrypt.compare(txtNewPassword.Text, user.password_hash) == true<br><br>Action: Return MSG-30 (New password cannot be the same as the current password). |
| --- | --- | --- |
| (8) | BR-48 | **Secure Hashing Rule:**<br><br>The new password must be hashed using bcrypt with a cost factor (salt rounds) of 12. |
| --- | --- | --- |
| (9) | BR-49 | **Global Session Purge (Security SLA):**<br><br>System must invalidate all sessions associated with the user_id EXCEPT the current session token.<br><br>Logic: Redis.keys("session:{user_id}:\*") -> Delete all except current session_id.<br><br>SLA: Must complete in < 1 second. |
| --- | --- | --- |
| (10) | BR-50 | **Performance SLA:**<br><br>The entire password update transaction (Verify + Hash + DB Update + Session Purge) must complete in < 2 seconds. |
| --- | --- | --- |
| (11) | BR-51 | **Audit Logging & Success Feedback:**<br><br>1\. Record the event: { event: 'PASSWORD_CHANGE', actor: @UserID, ip: @IP, status: 'SUCCESS' }.<br><br>2\. Action: Upon successful completion of the flow, trigger MSG-26. |
| --- | --- | --- |

#### 

#### **UC9:** Forgot Password

##### Use Case Description

| **Name** | **Forgot Password** |
| --- | --- |
| **Description** | This use case allows a user who has lost access to their account to reset their password using an Email OTP. The process ensures high security by expiring OTPs quickly and purging all potentially compromised sessions upon a successful reset. |
| --- | --- |
| **Actor** | Unauthenticated User |
| --- | --- |
| **Trigger** | User clicks the "Forgot Password?" link on the Login screen. |
| --- | --- |
| **Pre-condition** | User has a registered email address in the system. The account must be in 'ACTIVE' status. |
| --- | --- |
| **Post-condition** | Password is updated. All existing sessions are purged in **< 1s**. OTP is invalidated. Audit log is created. User is redirected to the login page. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (3) | BR-52 | **Account Identification & Security:**<br><br>System queries: SELECT user_id, status FROM Users WHERE email = @inputEmail.<br><br>Security Note: To prevent user enumeration, the system must trigger MSG-31 regardless of whether the email is found in the database. |
| --- | --- | --- |
| (4) | BR-53 | **OTP Generation & TTL:**<br><br>System generates a secure 6-digit OTP.<br><br>Logic: Store in Redis: SET "otp:reset:{email}" {code} EX 300 (5-minute expiration). |
| --- | --- | --- |
| (5) | BR-54 | **OTP Delivery SLA:**<br><br>System triggers NotificationService.sendOTP(email, code).<br><br>Performance SLA: The email must reach the mail server queue in < 30s. |
| --- | --- | --- |
| (8) | BR-55 | **OTP Verification Logic:**<br><br>Logic: IF inputOTP !== Redis.get("otp:reset:{email}") THEN RETURN MSG-32.<br><br>Action: Delete OTP immediately after one successful use or after 3 failed attempts to prevent brute-forcing. |
| --- | --- | --- |
| (11) | BR-56 | **Password Complexity & Match Check:**<br><br>1\. Complexity: Must match regex ^(?=.\*\[a-z\])(?=.\*\[A-Z\])(?=.\*\\d)(?=.\*\[@$!%\*?&\])\[A-Za-z\\d@$!%\*?&\]{8,}$. (If fail, show MSG-29).<br><br>2\. Match Logic: IF NewPassword !== ConfirmPassword THEN RETURN MSG-33. |
| --- | --- | --- |
| (13) | BR-57 | **Audit Logging:**<br><br>Record into Audit_Logs:<br><br>{ event: 'PASSWORD_RESET_OTP', email: @email, ip: @IP, timestamp: @TS, status: 'SUCCESS' }.<br><br>Action: Upon successful completion, trigger MSG-34. |
| --- | --- | --- |
| (14) | BR-58 | **Post-Reset Session Purge (Security SLA):**<br><br>Upon successful password update, the system must terminate ALL active sessions across all devices for that user_id.<br><br>Logic: Redis.DEL("session:{user_id}:\*").<br><br>SLA: Must complete in < 1 second. |
| --- | --- | --- |

#### 

#### 

#### **UC10:** Manage Session Timeout

##### Use Case Description

| **Name** | **Manage Session Timeout** |
| --- | --- |
| **Description** | Automatically monitors user inactivity to secure the account. The system warns the user after 28 minutes of idleness, allows for a 2-minute extension period, and performs a global logout across all tabs if no action is taken. |
| --- | --- |
| **Actor** | Authenticated User |
| --- | --- |
| **Trigger** | The system detects 28 minutes of inactivity (no API calls or navigation). |
| --- | --- |
| **Pre-condition** | User is successfully authenticated with an active session token. |
| --- | --- |
| **Post-condition** | Session is either extended for another 30 minutes or invalidated globally. Local storage is cleared, and the user is redirected to the Login page. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-59 | **Idle Detection (Client-side):**<br><br>The frontend monitors activity (mouse move, key press, API calls).<br><br>Logic: IF idle_time == 28_minutes THEN trigger(MSG-35). |
| --- | --- | --- |
| (4) | BR-60 | **Session Extension (Active):**<br><br>When "Extend Session" is clicked, the system calls /api/v1/auth/refresh.<br><br>Action: Issue a new JWT and update Redis EXPIRE to 1800s (30 mins). |
| --- | --- | --- |
| (5) | BR-61 | **Multi-Tab Sync (Broadcast):**<br><br>System must use BroadcastChannel or localStorage events to notify other tabs.<br><br>Logic: If Tab A extends the session, Tab B must reset its local idle timer to 0 immediately. |
| --- | --- | --- |
| (7) | BR-62 | **Automatic Invalidation:**<br><br>If the 2-minute countdown in MSG-35 hits 0:<br><br>1\. Call /api/v1/auth/logout.<br><br>2\. Clear localStorage, sessionStorage, and Auth Cookies.<br><br>3\. Action: Redirect to Login and display MSG-36. |
| --- | --- | --- |
| (8) | BR-63 | **Server-side Enforcement (API Layer):**<br><br>Every API request must verify token validity against the session store (Redis).<br><br>Logic: IF session_not_found OR expired THEN RETURN 401 Unauthorized and trigger MSG-36. |
| --- | --- | --- |
| (9) | BR-64 | **Token Blacklisting (Security SLA):**<br><br>Upon logout or timeout, the token must be added to a blacklist or removed from the active store.<br><br>SLA: Access must be blocked for that token in < 1 second. |
| --- | --- | --- |
| (10) | BR-65 | **Hard Close Recovery:**<br><br>If the browser is closed, the server session expires after 30 minutes of total inactivity. No "persistent" cookies allowed to bypass this for the current security level. |
| --- | --- | --- |

#### 

#### UC11: Manage Shared Data

##### Use Case Description

| **Name** | **Manage Shared Data** |
| --- | --- |
| **Description** | Allows the Platform Admin to manage all master data categories (Product Catalog, Commodity Types, UoM, Vehicle Types, and Administrative Boundaries). The system ensures data consistency across all tenants and maintains a non-destructive historical record. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin navigates to the "Master Data Management" dashboard. |
| --- | --- |
| **Pre-condition** | Admin is authenticated with PLATFORM_ADMIN role. |
| --- | --- |
| **Post-condition** | Shared data is updated / disabled globally. Changes take effect for all tenants in < 1s. Audit logs are persisted in AUDIT_LOGS. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-66 | **Master Category Scope:** The system must manage 5 primary tables: PRODUCT_CATALOG, COMMODITY_TYPES, UNITS_OF_MEASURE, VEHIECLE_TYPES, and ADMIN_BOUNDARIES. |
| --- | --- | --- |
| (4) | BR-67 | **Uniqueness Rule:** Within any category, the Name or Code must be unique across the platform.<br><br>Logic: SELECT COUNT(\*) FROM \[TABLE\] WHERE (name = @name OR code = @code).<br><br>Action: If Count > 0, return 409 Conflict and trigger MSG-39. |
| --- | --- | --- |
| (4) | BR-68 | **Mandatory Fields Rule:** Every master entry must contain at least a Name and a unique Code.<br><br>Action: If any mandatory field is empty on save, display MSG-40. |
| --- | --- | --- |
| (4) | BR-69 | **Vehicle Capacity Validation:** For the Vehicle_Types category, Max_Payload and Max_Volume must be numeric and > 0.<br><br>Action: If values are <= 0, apply red border to fields and display MSG-41. |
| --- | --- | --- |
| (6) | BR-70 | **Soft-Disable Policy (UI):** Physical deletion of master data is strictly forbidden.<br><br>Action: Before updating status, system must call MSG-37 for user confirmation. |
| --- | --- | --- |
| (6) | BR-71 | **Soft-Disable Execution (DB):** Upon confirmation of MSG-37, system executes:<br><br>UPDATE \[TABLE\] SET is_active = 0, disabled_at = UTC_TIMESTAMP WHERE id = @id. |
| --- | --- | --- |
| (7) | BR-72 | **Reference Awareness:** Disabling an entry will not affect existing historical shipments but will hide the entry from all new transaction dropdowns across all tenants. |
| --- | --- | --- |
| (9) | BR-73 | **Global Cache Invalidation (SLA):** Upon successful DB commit, the system must trigger a cache purge via Redis Pub/Sub.<br><br>Performance SLA: All tenant instances must reflect the change in < 1 second. |
| --- | --- | --- |
| (9) | BR-74 | **Success Feedback:** After successful synchronization and cache update, the system must display MSG-38. |
| --- | --- | --- |
| (10) | BR-75 | **Detailed Audit Logging:** Every create/disable action must be recorded in Audit_Logs.<br><br>Data: { table_name: @table, record_id: @id, old_data: @old, new_data: @new, actor_id: @admin_id, ip: @IP }. |
| --- | --- | --- |
| (11) | BR-76 | **Tenant-Side Selection Rule:** All API endpoints serving dropdowns for tenants must strictly apply the filter: WHERE is_active = 1. |
| --- | --- | --- |
| (12) | BR-77 | **Administrative Boundaries Integrity:** For Admin_Boundaries, parent-child relationships (Province > District > Ward) must be validated.<br><br>Action: If an orphan record is detected, block save and display MSG-40. |
| --- | --- | --- |
| (13) | BR-78 | **System Responsiveness:** Master data update API must respond in < 500ms to ensure the admin UI remains fluid. |
| --- | --- | --- |

#### 

#### 

#### **UC12:** Search And Trace Audit Logs

##### Use Case Description

| **Name** | **Search And Trace Audit Logs** |
| --- | --- |
| **Description** | Provides the Platform Admin with a high-performance interface to trace system activities. It ensures historical integrity through a strictly append-only database policy and features real-time self-monitoring to prevent any silent loss of audit data. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin navigates to the "Audit & Compliance" section of the Platform panel. |
| --- | --- |
| **Pre-condition** | Admin is authenticated with PLATFORM_ADMIN permissions. The AUDIT_LOGS table is active. |
| --- | --- |
| **Post-condition** | Filtered logs are displayed or exported to CSV. Any write failure is immediately flagged by the system's self-monitoring service. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-79 | **DB Layer Security (Append-only):** The AUDIT_LOGS table must not have UPDATE or DELETE permissions granted to any application-level user. Only INSERT and SELECT are allowed to ensure tamper-proof history. |
| --- | --- | --- |
| (2) | BR-80 | **Mandatory Record Content:** Each log entry must display: Actor (Username/ID), IP_Address, Action_Type, Resource_ID, Timestamp (UTC), and Outcome (Success/Failure). |
| --- | --- | --- |
| (3) | BR-81 | **Indexed Filtering Performance:** Search must support filters for User, Date Range (From/To), and Action Type.<br><br>Performance SLA: Results must be returned in < 5 seconds via composite indexing on timestamp and actor_id. |
| --- | --- | --- |
| (4) | BR-82 | **Empty Search State:** If no records match the applied filters, the system must display MSG-43. |
| --- | --- | --- |
| (5) | BR-83 | **Data Privacy Masking:** Before rendering or exporting, any sensitive tokens or credential fragments in the payload field must be masked with \*\*\*\*\*\*\*\*. |
| --- | --- | --- |
| (6) | BR-84 | **Export to CSV Rule:** The system must support exporting the current filtered view. The process must use streaming to handle datasets > 10,000 rows without crashing the browser memory. |
| --- | --- | --- |
| (7) | BR-85 | **Export Success Notification:** Upon successful generation of the CSV file, the system must display MSG-42. |
| --- | --- | --- |
| (8) | BR-86 | **Export Activity Logging:** The act of exporting audit logs is itself a sensitive action and must be recorded as a new entry in AUDIT_LOGS (Action: LOG_EXPORT). |
| --- | --- | --- |
| (9) | BR-87 | **Write Failure Self-Detection:** The background AuditMonitorService must perform a heartbeat check on the logging pipeline every 60 seconds. |
| --- | --- | --- |
| (10) | BR-88 | **Critical Alerting (No Silent Loss):** If a write failure is detected (e.g., DB Disk Full, Connection Timeout), the system must immediately trigger MSG-44 on the Admin UI and send emergency alerts via NotificationService. |
| --- | --- | --- |
| (11) | BR-89 | **Audit Retention Policy:** Logs are kept indefinitely in the primary table. Any archiving process must be a separate, documented administrative procedure. |
| --- | --- | --- |

#### 

#### **UC13:** Monitor System Health

##### Use Case Description

| **Name** | **Monitor System Health** |
| --- | --- |
| **Description** | Monitors the operational status of all platform services and tracks tenant storage utilization. Provides real-time visual feedback, automatic email alerting for downtime, and visual warnings for storage quota limits. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin accesses the "System Monitor" dashboard or the automated heartbeat cycle (every 5 mins) triggers. |
| --- | --- |
| **Pre-condition** | Admin is authenticated. The SYSTEM_SERVICES and TENANT_STORAGE_QUOTAS tables are populated. |
| --- | --- |
| **Post-condition** | Health logs are recorded in SYSTEM_HEALTH_LOGS. Alerts are dispatched. Dashboard reflects current status using standardized color coding. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-90 | **Automated Heartbeat:** The system must ping all services in SYSTEM_SERVICES every 5 minutes. |
| --- | --- | --- |
| (3) | BR-91 | **Service Failure Detection:** If a service fails 3 consecutive pings:<br><br>1\. Update status to 'DOWN' in SYSTEM_SERVICES.<br><br>2\. Call Alert_Service to send an email in < 1s.<br><br>3\. Trigger MSG-45 (Critical Alert). |
| --- | --- | --- |
| (5) | BR-92 | **Success Confirmation:** If all services respond successfully within a check cycle:<br><br>Action: Update UI status to 'Healthy' and trigger MSG-47 (Success Notification). |
| --- | --- | --- |
| (7) | BR-93 | **Quota Calculation Logic:** The system must aggregate the size of all uploaded files for each tenant: SUM(file_size) GROUP BY tenant_id. |
| --- | --- | --- |
| (8) | BR-94 | **Threshold Warning (80%):**<br><br>Logic: IF (usage / quota) >= 0.8 THEN:<br><br>1\. Set row background to Yellow.<br><br>2\. Trigger MSG-46 (Warning Notification). |
| --- | --- | --- |
| (11) | BR-95 | **Scale Performance:** Storage calculations must be performed by an asynchronous background worker to ensure file uploads are not blocked. |
| --- | --- | --- |
| (11) | BR-96 | **Real-time UI Sync:** Status changes in the database must be pushed to the dashboard via WebSockets in < 1s without page reload. |
| --- | --- | --- |
| (13) | BR-97 | **Visual Status Coding:**<br><br>\- Green: Response < 200ms.<br><br>\- Yellow: Response 200ms - 1000ms.<br><br>\- Red: Response > 1000ms or 5xx error. |
| --- | --- | --- |

#### 

#### 

#### UC14: Manage Profile

##### Use Case Description

| **Name** | **Manage Profile** |
| --- | --- |
| **Description** | This use case allows an authenticated user to update their personal information, including their display name, phone number, and avatar. If the user attempts to change their email address, the system enforces a mandatory OTP (One-Time Password) verification to ensure the new email is valid and owned by the user. |
| --- | --- |
| **Actor** | Authenticated User |
| --- | --- |
| **Trigger** | User navigates to the "Profile Settings" page and clicks "Edit Profile." |
| --- | --- |
| **Pre-condition** | User is successfully authenticated. The user account status in the USERS table must be 'ACTIVE'. |
| --- | --- |
| **Post-condition** | Profile data is updated in the database. Active session metadata is refreshed globally. Changes are recorded in AUDIT_LOGS. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-98 | **Profile Data Retrieval:** Upon entering the view, the system must fetch the current user data from the USERS table. |
| --- | --- | --- |
| (4) | BR-99 | **Avatar Validation:**<br><br>1\. Supported formats: .jpg, .jpeg, .png.<br><br>2\. Max file size: 2MB.<br><br>Action: If validation fails, block upload and display MSG-52. |
| --- | --- | --- |
| (4) | BR-100 | **Mandatory Fields:** The Name and Email fields must not be empty.<br><br>Action: If empty on save, highlight fields in red and display MSG-53. |
| --- | --- | --- |
| (4) | BR-101 | **Phone Number Format:** Must match the international or local regex: ^\\+?\[0-9\]{10,15}$. |
| --- | --- | --- |
| (5) | BR-102 | **User Final Confirmation:** After all validations/OTP but BEFORE DB update. Action: The system must trigger MSG-48. If cancelled, abort transaction. |
| --- | --- | --- |
| (6) | BR-103 | **Email Change Detection:** The system must compare the input email with the existing email in the USERS table.<br><br>Logic: IF input_email !== current_email THEN trigger OTP_Verification_Flow. |
| --- | --- | --- |
| (6) | BR-104 | **OTP Generation for Email:**<br><br>1\. Generate a 6-digit numeric code.<br><br>2\. Store in Redis with a 5-minute TTL.<br><br>3\. Send code to the NEW email address.<br><br>Action: Notify user with MSG-50. |
| --- | --- | --- |
| (7) | BR-105 | **OTP Verification Logic:** The update is blocked until the user provides the correct OTP.<br><br>Logic: IF input_otp !== Redis.get(email_key) THEN display MSG-51. |
| --- | --- | --- |
| (8) | BR-106 | **Atomic Data Update:** Once verified, the system updates the USERS table.<br><br>Logic: UPDATE USERS SET name=@name, email=@email, phone=@phone, avatar_url=@url WHERE id=@id. |
| --- | --- | --- |
| (9) | BR-107 | **Audit Logging:** Every profile change must be logged.<br><br>Table: AUDIT_LOGS.<br><br>Data: { action: 'PROFILE_UPDATE', actor_id: @id, changes: @json_diff, timestamp: @ts }. |
| --- | --- | --- |
| (10) | BR-108 | **Global Session Synchronization:**<br><br>To ensure changes are reflected across all active sessions:<br><br>1\. Update the user metadata in the Session Store (Redis).<br><br>2\. Broadcast a "Profile_Updated" event via WebSockets to all active tabs. |
| --- | --- | --- |
| (11) | BR-109 | **Success Feedback:** Upon successful completion of all database and cache updates, the system must display MSG-49. |
| --- | --- | --- |

#### 

#### UC15: Resolve Escalated Dispute

##### Use Case Description

| **Name** | **Resolve Escalated Dispute** |
| --- | --- |
| **Description** | Allows a Platform Admin to investigate and provide a final ruling on disputes that could not be resolved at the tenant level. The Admin reviews evidence, transaction history, and status updates to either resolve or reject the complaint, with mandatory notifications sent to all involved parties. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Admin accesses the "Escalated Disputes" queue in the Platform Administration panel. |
| --- | --- |
| **Pre-condition** | Admin is authenticated with PLATFORM_ADMIN role. The complaint must have a status of 'ESCALATED'. |
| --- | --- |
| **Post-condition** | Complaint status is updated to 'RESOLVED' or 'REJECTED'. Resolution notes are persisted. Involved parties (Buyer, Supplier, Carrier) are notified. Audit logs are updated. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-110 | **Access Authorization (Security):** Access to escalated disputes must be enforced at the API level via JWT role check. If a non-admin attempts access, return 403 Forbidden and trigger MSG-57. |
| --- | --- | --- |
| (3) | BR-111 | **Queue Filtering Rule:** The dispute dashboard must strictly filter records from the COMPLAINTS table where status = 'ESCALATED'. |
| --- | --- | --- |
| (3) | BR-112 | **Data Loading SLA:** The system must aggregate data from COMPLAINTS, SHIPMENTS, and EVIDENCE_ATTACHMENTS.<br><br>**Performance SLA:** The full detail view must load in < 3 seconds. |
| --- | --- | --- |
| (3) | BR-113 | **Evidence Integrity:** Admins must be able to view all linked assets (Images, PDF documents) stored in Cloudinary. Attachments are read-only. |
| --- | --- | --- |
| (8) | BR-114 | **Resolution Note Requirement:** The Resolution_Note field is mandatory for both 'Resolve' and 'Reject' actions.<br><br>Action: If the field is empty upon submission, block the action and display MSG-56. |
| --- | --- | --- |
| (9) | BR-115 | **Decision Confirmation:** Before committing the status change to the database.<br><br>Action: The system must trigger MSG-54 to confirm the final decision. |
| --- | --- | --- |
| (10) | BR-116 | **State Transition Logic:**<br><br>1\. If 'Resolve': UPDATE COMPLAINTS SET status='RESOLVED', resolved_at=UTC_TIMESTAMP, note=@note.<br><br>2\. If 'Reject': UPDATE COMPLAINTS SET status='REJECTED', resolved_at=UTC_TIMESTAMP, note=@note. |
| --- | --- | --- |
| (10) | BR-117 | **Finality Rule:** Once a dispute is moved to 'RESOLVED' or 'REJECTED', it cannot be moved back to 'ESCALATED' or 'OPEN'. |
| --- | --- | --- |
| (11) | BR-118 | **Action Auditing:** Every decision must be recorded in AUDIT_LOGS.<br><br>Data: { action: 'DISPUTE_RESOLUTION', target_id: @complaint_id, decision: @status, note: @note, actor_id: @admin_id }. |
| --- | --- | --- |
| (12) | BR-119 | **Multi-Party Notification:** Upon status update, the NotificationService must dispatch alerts (In-app and Email) to the Buyer, Supplier, and Carrier associated with the shipment. |
| --- | --- | --- |
| (13) | BR-120 | **Success Feedback:** After successful database commit and notification dispatch, display MSG-55. |
| --- | --- | --- |

#### 

#### 

#### UC16: View Supplier Reputation Score

##### Use Case Description

| **Name** | **View Supplier Reputation Score** |
| --- | --- |
| **Description** | Allows authorized Buyer Staff to view the reputation scores of Suppliers during procurement. This system-generated metric ensures transparency and aids in selecting reliable partners based on historical transaction performance. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | User views a Product Card or accesses the Supplier Quotation Comparison screen. |
| --- | --- |
| **Pre-condition** | User is authenticated within a Buyer workspace with BUYER_STAFF or BUYER_ADMIN permissions. |
| --- | --- |
| **Post-condition** | Reputation metrics are displayed with appropriate warnings or informational tooltips. All calculations are maintained by the background sync service. |
| --- | --- |

##### 

##### Activities FLow

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-121 | **Visibility & Security:** Scores are only visible to users within the Buyer workspace. Suppliers cannot view their own score compared to others, and the API must enforce BUYER role checks. If unauthorized, trigger MSG-59. |
| --- | --- | --- |
| (3) | BR-122 | **UI Performance SLA:** Reputation data must be fetched and rendered alongside product / quotation data in < 2 seconds. |
| --- | --- | --- |
| (4) | BR-123 | **Normalization Scale:** The raw performance data must be normalized to a standard 1-5 star scale for UI consistency. |
| --- | --- | --- |
| (5) | BR-124 | **Display Locations:**<br><br>The score must be rendered on:<br><br>1\. Product Cards: Next to the Supplier name.<br><br>2\. Quotation Comparison: As a sortable / filterable column. |
| --- | --- | --- |
| (6) | BR-125 | **Information Disclosure Rule:** To ensure transparency, an info-icon must be placed next to the score. Clicking or hovering over this icon must trigger MSG-58 to explain the real-time nature of the score. |
| --- | --- | --- |
| (7) | BR-126 | **Low Score Warning:** If a Supplier's score falls below the 20% threshold (or 1.5 stars), the system should trigger MSG-60 as a tooltip warning for the Buyer. |
| --- | --- | --- |
| (8) | BR-127 | **Automatic Update Triggers:**<br><br>The SUPPLIER_REPUTATION table must be recalculated automatically upon:<br><br>1\. Final Goods Receipt Confirmation (Order completion).<br><br>2\. Closing of a dispute in the COMPLAINTS table. |
| --- | --- | --- |
| (9) | BR-128 | **Reputation Calculation Formula:**<br><br>The score must be calculated using 4 weighted variables:<br><br>1\. Fulfillment Accuracy: Correct items/quantity vs. Ordered.<br><br>2\. Completion Rate: Completed orders vs. Total (non-buyer cancelled).<br><br>3\. Dispute Rate: Total disputes resolved against the supplier.<br><br>4\. On-time Readiness: Goods ready status vs. Agreed ready date. |
| --- | --- | --- |
| (9) | BR-129 | **Carrier Responsibility Exclusion:** Metrics related to delivery transit time, ETA accuracy, or shipping delays must be strictly excluded from the Supplier score and assigned to the Carrier profile. |
| --- | --- | --- |
| (10) | BR-130 | **No Manual Override:** Reputation scores are system-generated based on transaction data. Manual adjustments by Platform Admins or Suppliers are strictly prohibited to ensure data integrity. |
| --- | --- | --- |

#### 

#### 

#### UC17: View Carrier Reputation Score

##### Use Case Description

| **Name** | **View Carrier Reputation Score** |
| --- | --- |
| **Description** | Allows authorized Buyer and Supplier Staff to view the reliability metrics of Carriers during the freight selection process. The score is system-generated, reflecting the Carrier’s historical performance in terms of timing and cargo safety. |
| --- | --- |
| **Actor** | Buyer Staff, Supplier Staff (if involved in selection) |
| --- | --- |
| **Trigger** | User accesses the Freight Quotation comparison screen or views Carrier details in a contract. |
| --- | --- |
| **Pre-condition** | User is authenticated. The Carrier has at least one completed shipment in the system to generate a score. |
| --- | --- |
| **Post-condition** | The reputation score is rendered with appropriate visual indicators and information tooltips. No data can be modified by the user. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-131 | **Security & Access Control:** Visibility is restricted to users within the specific transaction loop. Logic: IF user.role NOT IN ('BUYER', 'SUPPLIER') THEN return 403 Forbidden and trigger MSG-62. |
| --- | --- | --- |
| (3) | BR-132 | **Performance SLA:** The reputation score and its metadata must be fetched and rendered in < 2 seconds. |
| --- | --- | --- |
| (4) | BR-133 | **Standard Normalization:** All raw metrics must be normalized to a 1.0 - 5.0 star scale for UI consistency. |
| --- | --- | --- |
| (5) | BR-134 | **Display Constraints:** Scores must be rendered as stars in the Freight Quotation List and the Quotation Comparison Screen. |
| --- | --- | --- |
| (6) | BR-135 | **Transparency Requirement:** An information icon must be present. Clicking it must trigger MSG-61 to explain that the score is based on historical e-POD data. |
| --- | --- | --- |
| (7) | BR-136 | **Risk Alert Logic:** If the carrier's score is < 2.0 stars, the system must trigger MSG-63 (Red Warning Label) next to the carrier's name. |
| --- | --- | --- |
| (8) | BR-137 | **Automated Recalculation Trigger:**<br><br>Recalculate CARRIER_REPUTATION table immediately after:<br><br>1\. e-POD verified.<br><br>2\. Incident marked as 'RESOLVED'. |
| --- | --- | --- |
| (9) | BR-138 | **Reputation Calculation Formula:**<br><br>The score is a weighted composite of:<br><br>1\. On-time Delivery.<br><br>2\. Delay Frequency.<br><br>3\. Incident Rate.<br><br>4\. Completion Rate (e-POD). |
| --- | --- | --- |
| (9) | BR-139 | **Critical Incident Weighting:** Incidents categorized as "Cargo Damage" or "Theft" reduce the score 3x more heavily than simple "Traffic Delays." |
| --- | --- | --- |
| (10) | BR-140 | **Data Immutability (No Manual Override):** Scores are strictly derived from system transactions. Manual adjustments by any role are strictly prohibited. |
| --- | --- | --- |

#### 

#### 

#### UC18: Exchange Message

##### Use Case Description

| **Name** | **Exchange Message** |
| --- | --- |
| **Description** | Allows participants of a specific transaction (RFQ, Quotation, Order, Shipment, or Dispute) to communicate directly. The system maintains an immutable, append-only chat history that supports rich text and file attachments, ensuring all parties stay aligned with a "single source of truth." |
| --- | --- |
| **Actor** | Authenticated User |
| --- | --- |
| **Trigger** | User opens the "Communication" or "Messages" tab within a specific transaction detail view. |
| --- | --- |
| **Pre-condition** | User is authenticated. The user's WORKSPACE_ID must be linked as an active participant in the target transaction ID. |
| --- | --- |
| **Post-condition** | Message is delivered to all participants in < 2s. History is persisted in TRANSACTION_MESSAGES. Attachments are stored and linked. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-141 | **Historical Retrieval Rule:** When the chat is opened, the system fetches the last 50 messages by default. Logic: SELECT \* FROM TRANSACTION_MESSAGES WHERE ref_id = @id ORDER BY timestamp DESC LIMIT 50. |
| --- | --- | --- |
| (1) | BR-142 | **File Availability:** Attachments must be served via pre-signed URLs with a 30-minute expiry to ensure security while viewing historical documents. |
| --- | --- | --- |
| (2) | BR-143 | **Contextual Binding Rule:** Every message must be strictly keyed to a Transaction_Type (RFQ/ORDER/SHIPMENT/DISPUTE) and a Resource_ID. Floating messages are prohibited. |
| --- | --- | --- |
| (2) | BR-144 | **Security Isolation:** System must verify the actor via TRANSACTION_PARTICIPANTS. Logic: IF workspace_id NOT IN participants THEN trigger MSG-66 (403 Forbidden). |
| --- | --- | --- |
| (3) | BR-145 | **Content Integrity Check:** A message must contain either a non-empty Content string or at least one record in MESSAGE_ATTACHMENTS.<br><br>Action: If both are empty, block send and display MSG-65. |
| --- | --- | --- |
| (3) | BR-146 | **Attachment Policy:**<br><br>1\. Allowed Extensions: .pdf, .jpg, .png, .docx, .xlsx.<br><br>2\. Max size: 5MB per file.<br><br>Action: If criteria are not met, display MSG-67. |
| --- | --- | --- |
| (3) | BR-147 | **Attachment Confirmation:** If the user attaches one or more files before sending.<br><br>Action: The system must trigger MSG-68 to confirm the intent to upload and share. |
| --- | --- | --- |
| (4) | BR-148 | **Append-Only Enforcement:** The TRANSACTION_MESSAGES table must not have UPDATE or DELETE API endpoints. Once a message is sent, its Content and Timestamp are immutable at the database layer. |
| --- | --- | --- |
| (4) | BR-149 | **Metadata Persistence:** Each record must automatically capture: Sender_ID, Workspace_ID, UTC_Timestamp, and Client_IP. |
| --- | --- | --- |
| (5) | BR-150 | **Real-time Delivery SLA:** Using WebSockets (Socket.io), the message must be pushed to all active participant sessions in < 2 seconds. |
| --- | --- | --- |
| (6) | BR-151 | **Success Feedback:** Upon successful write to TRANSACTION_MESSAGES, the system must trigger MSG-64 (Success Toast). |
| --- | --- | --- |

#### 

### Supplier

#### **UC1**9**: Create Catalog Category**

##### Use Case Description

| **Name** | **Create Catalog** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to create a new product catalog category within their workspace. The category name must be unique within the workspace. Upon creation, the category is immediately available for use in product listings. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff clicks "Add Category" on the Catalog Category management page and submits the form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Workspace is ACTIVE with the Supplier role enabled. |
| --- | --- |
| **Post-condition** | New category is persisted and immediately visible in the product management category dropdown. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (3) | BR-152 | **Workspace-Scoped Uniqueness:** On blur/onChange of \[txtCategoryName\], system calls GET /catalog-categories/check-name. Query: SELECT COUNT(\*) FROM CatalogCategories WHERE workspace_id=@WS_ID AND name=@Name AND is_active=1. If count > 0: show inline MSG-69 and disable \[btnSave\]. |
| --- | --- | --- |
| (4) | BR-153 | **Mandatory Name Field:** The name field must not be empty or whitespace-only. Validated at both UI (onChange) and API layer. Action: If blank on submit, display MSG-70 and block submission. Validates name uniqueness a final time. If conflict, returns 409 and MSG-69. |
| --- | --- | --- |
| (6) | BR-154 | **Persistence:** System executes: INSERT INTO CatalogCategories (workspace_id, name, description, created_by, created_at) VALUES (@WS_ID, @Name, @Desc, @UserID, UTC_TIMESTAMP()). Default is_active = 1. |
| --- | --- | --- |
| (8) | BR-156 | **Immediate Visibility:** Upon successful insert, system publishes EVENT_CATALOG_CATEGORY_CREATED. All product creation and editing forms reflect the new category in their dropdowns within < 1s without page reload. Referenced message: MSG-71. |
| --- | --- | --- |
| (7) | BR-156 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "CREATE_CATALOG_CATEGORY", actor: @UserID, target: @CategoryID, metadata: { ip: @IP, timestamp: @TS, workspace_id: @WS_ID, name: @Name } }. Upon success, trigger MSG-71. |
| --- | --- | --- |

#### 

#### UC20: Update Catalog Category

##### Use Case Description

| **Name** | **Update Catalog Category** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to update the name or description of an existing catalog category. The updated name must remain unique within the workspace. Changes are reflected immediately across the platform. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff clicks the edit icon on a catalog category row and submits the updated form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Target category exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Category name and/or description are updated. Changes are immediately reflected in all product listings and dropdowns that reference this category. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-157 | **Workspace Ownership Verification:** Before rendering edit form, system checks: SELECT workspace_id FROM CatalogCategories WHERE id=@CategoryID. If workspace_id != requesting user's workspace_id, reject with HTTP 403 and trigger MSG-72. |
| --- | --- | --- |
| (3) | BR-158 | **Uniqueness Re-validation on Update:** System checks name conflicts excluding the record being edited: SELECT COUNT(\*) FROM CatalogCategories WHERE workspace_id=@WS_ID AND name=@NewName AND id != @CategoryID AND is_active=1. If count > 0, show MSG-69 and disable \[btnSave\]. |
| --- | --- | --- |
| (4) | BR-159 | **Mandatory Name Field on Update:** The name field must not be empty or whitespace-only on submission. Action: If blank, display MSG-70 and block save. |
| --- | --- | --- |
| (6) | BR-160 | **Update Persistence:** Execute: UPDATE CatalogCategories SET name=@NewName, description=@NewDesc, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@CategoryID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (8) | BR-161 | **Immediate Reflection & Audit Logging:** Updated category name propagates to all active product dropdowns within < 1s without page reload. Record into System_Audit: { action: "UPDATE_CATALOG_CATEGORY", actor: @UserID, target: @CategoryID, metadata: { old_name: @OldName, new_name: @NewName } }. Trigger MSG-73 on success. |
| --- | --- | --- |

#### 

#### UC21: Add Product To Catalog

##### Use Case Description

| **Name** | **Add Product To Catalog** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to add a new product — including pricing, descriptions, images, and attributes — to their workspace catalog. The product becomes discoverable by Buyers immediately after publication. SKU uniqueness is enforced within the workspace. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff clicks "Add Product" and submits the product creation form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Workspace is ACTIVE with Supplier role enabled. At least one active catalog category exists. |
| --- | --- |
| **Post-condition** | Product is persisted with status PUBLISHED. Product is immediately visible in Buyer search results. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-162 | **SKU Uniqueness (Real-Time):** On each keystroke (debounced 300ms), system calls GET /products/check-sku?ws_id=@WS_ID&sku=@SKU. Query: SELECT COUNT(\*) FROM Products WHERE workspace_id=@WS_ID AND sku=@SKU. If count > 0: show MSG-74 inline and disable \[btnSave\]. |
| --- | --- | --- |
| (4) | BR-163 | **Image Upload Constraint:** Each product image must be JPG or PNG, max 5MB. Images are uploaded to INF-SVC-02 before form submission. If any image exceeds the size limit or has wrong format, display MSG-76 and exclude that file. At least one image is recommended but not mandatory. |
| --- | --- | --- |
| (5) | BR-164 | **Mandatory Fields :** Required fields: name, sku, category_id, unit_of_measure, reference_price (positive number). Validated at both UI and API layer. Action: If any mandatory field is empty or invalid on submit, display MSG-75 and block submission. |
| --- | --- | --- |
| (7) | BR-165 | **Default Publication Status & Persistence:** Upon successful creation, product is automatically assigned status PUBLISHED (is_visible=1). Execute: INSERT INTO Products (workspace_id, category_id, name, sku, unit_of_measure, reference_price, description, is_visible, created_by, created_at) VALUES (...). Supplier Staff does not need to manually set visibility. |
| --- | --- | --- |
| (8) | BR-166 | **Immediate Buyer Visibility & Audit:** Product appears in Buyer-facing search results within < 3s. No cache flush required. Record into System_Audit: { action: "ADD_PRODUCT", actor: @UserID, target: @ProductID, metadata: { sku: @SKU } }. Trigger MSG-77 on success. |
| --- | --- | --- |

#### 

#### UC22: Update Product Details

##### Use Case Description

| **Name** | **Update Product Details** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to update the details of an existing product — including pricing, descriptions, images, and attributes. The catalog is updated immediately. Previous product version data is retained in history to preserve the integrity of open RFQs referencing the old details. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff clicks the edit icon on a product row and submits the updated product form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Target product exists, belongs to the user's workspace, and has status PUBLISHED or HIDDEN. |
| --- | --- |
| **Post-condition** | Product details are updated and immediately visible in the catalog. Previous version is retained for audit and RFQ reference purposes. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-167 | **SKU Immutability:** The sku field is read-only during update. System renders SKU as disabled in the UI and rejects any API request attempting to change it: IF @NewSKU != Products.sku THEN REJECT WITH HTTP 400. |
| --- | --- | --- |
| (3) | BR-168 | **Version Snapshot on Update:** Same constraints as BR-164 (JPG/PNG, max 5MB). Existing images not removed by the user are retained. New images are uploaded to INF-SVC-02 before the update call. Invalid files trigger MSG-76. |
| --- | --- | --- |
| (5) | BR-169 | **Image Constraint on Update:** Same constraints as BR-97 apply. Existing images not removed by the user are retained. New images are uploaded to INF-SVC-02 before the update call. |
| --- | --- | --- |
| (7) | BR-170 | **Update Persistence & Immediate Catalog Reflection:** Execute: UPDATE Products SET name=@Name, category_id=@CatID, description=@Desc, reference_price=@Price, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@ProductID AND workspace_id=@WS_ID. Updated product details appear in Buyer-facing catalog within < 3s. |
| --- | --- | --- |
| (8) | BR-171 | **Audit Logging & Success Feedbac:** Record into System_Audit: { action: "UPDATE_PRODUCT", actor: @UserID, target: @ProductID, metadata: { fields_changed: \[@FieldList\] } }. Upon success, trigger MSG-78. |
| --- | --- | --- |

#### 

#### UC23: Manage Product Visibility

##### Use Case Description

| **Name** | **Manage Product Visibility** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to toggle the visibility of a product between PUBLISHED (visible to Buyers) and HIDDEN (not visible to Buyers). The change takes effect immediately without requiring a page reload. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff clicks the visibility toggle on a product row in the catalog management list. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Target product exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Product visibility status is updated. If set to HIDDEN, product is immediately removed from Buyer search results. If set to PUBLISHED, product is immediately available in Buyer search results. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-172 | **Ownership Verification:** System verifies: SELECT workspace_id FROM Products WHERE id=@ProductID. If workspace_id != requesting user's workspace_id, reject with HTTP 403. |
| --- | --- | --- |
| (4) | BR-173 | **Toggle State Machine:** Allowed transitions: PUBLISHED → HIDDEN and HIDDEN → PUBLISHED. Execute: UPDATE Products SET is_visible=@NewState, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@ProductID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (5) | BR-174 | **Immediate Effect on Buyer Search:** Upon status update, system publishes EVENT_PRODUCT_VISIBILITY_CHANGED to the search index service. Buyer-facing search queries filter by is_visible=1. Constraint: change must be reflected in Buyer search results within < 1s of toggle confirmation. |
| --- | --- | --- |
| (3) | BR-175 | **Open RFQ Safeguard:** If the product being hidden has one or more open RFQs (status PENDING or NEGOTIATING), system displays MSG-79. Staff must acknowledge before proceeding. The toggle is not blocked — hiding does not cancel open RFQs. |
| --- | --- | --- |
| (6) | BR-176 | **Audit Logging & Success:** Record into System_Audit: { action: "TOGGLE_PRODUCT_VISIBILITY", actor: @UserID, target: @ProductID, metadata: { new_state: @NewState } }. Trigger MSG-80 on success. |
| --- | --- | --- |

#### 

#### UC24: Search Catalog Items

##### Use Case Description

| **Name** | **Search Catalog Items** |
| --- | --- |
| **Description** | This use case allows a Supplier Staff member to search, filter, and sort their own product catalog by keyword, category, price range, and status. Results are returned within 2 seconds and ranked by relevance to the keyword. |
| --- | --- |
| **Actor** | Supplier Staff |
| --- | --- |
| **Trigger** | Supplier Staff enters a keyword or applies one or more filters on the catalog management search page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_STAFF or higher. Workspace is ACTIVE with Supplier role enabled. |
| --- | --- |
| **Post-condition** | Matching products are displayed ranked by relevance. Results reflect the current state of the catalog at query time. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-177 | **Workspace Isolation:** All search queries are strictly scoped to the requesting user's workspace: WHERE workspace_id=@WS_ID. Results from other workspaces are never returned, enforced at the DB query level. \| Keyword Search Scope & Filters: Keyword performs case-insensitive match against name and sku: WHERE (name ILIKE '%@Keyword%' OR sku ILIKE '%@Keyword%'). Optional filters applied as AND conditions: category_id=@CatID, reference_price BETWEEN @MinPrice AND @MaxPrice, is_visible=@Status. |
| --- | --- | --- |
| (3) | BR-178 | **Sort Options:** System supports three sort modes: name ASC, reference_price ASC/DESC, updated_at DESC. Default sort is updated_at DESC when no explicit sort is selected. |
| --- | --- | --- |
| (4) | BR-179 | **Performance Constraint:** Query must return results within < 2s. Required indexes on: (workspace_id, name), (workspace_id, sku), and (workspace_id, category_id, is_visible). |
| --- | --- | --- |
| (5) | BR-180 | **Result Completeness & Empty State:** Results include: id, sku, name, category_name, reference_price, is_visible, updated_at, and first image thumbnail URL (signed URL). If no records match current filters, system displays MSG-81. |
| --- | --- | --- |

#### 

#### UC25: Approve Order

##### Use Case Description

| **Name** | **Approve Order** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to approve a purchase order received from a Buyer, signaling that the Supplier accepts the order and will proceed with fulfillment. The Buyer is notified of the approval within 30 seconds. The approval is recorded in the audit log. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff opens a purchase order in PENDING status and clicks the "Approve" button. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher. Target order exists with status PENDING and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Order status is updated to APPROVED. Buyer receives an email and push notification within < 30 s. Approval is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-181 | **Order Status Pre-Check:** System verifies the order's current status is PENDING before allowing approval: SELECT status FROM Orders WHERE id=@OrderID AND workspace_id=@WS_ID. If status is not PENDING, the approve action is rejected to prevent invalid state transitions. |
| --- | --- | --- |
| (3) | BR-182 | **Approval Confirmation:** Before executing the state transition, system must display MSG-82 for final admin confirmation. |
| --- | --- | --- |
| (4) | BR-183 | **Credit Limit Check at Approval:** System invokes SUP-SVC-05 to evaluate: outstanding_balance + order_value vs. credit_limit. If total exceeds limit: order transitions to PENDING_CREDIT_APPROVAL, Chief Accountant is notified, and MSG-83 is displayed. Approval flow is aborted. |
| --- | --- | --- |
| (5) | BR-184 | **State Transition with Race Condition Guard:** Execute: UPDATE Orders SET status='APPROVED', approved_by=@UserID, approved_at=UTC_TIMESTAMP() WHERE id=@OrderID AND status='PENDING'. The AND status='PENDING' clause prevents duplicate approvals by concurrent actors. |
| --- | --- | --- |
| (6) | BR-185 | **Notification SLA & Audit Logging:** System publishes EVENT_ORDER_APPROVED. INF-SVC-01 dispatches email and push notification to Buyer within < 30s. Record into System_Audit: { action: "APPROVE_ORDER", actor: @UserID, target: @OrderID, metadata: { buyer_id: @BuyerID } }. Trigger MSG-84 on success. |
| --- | --- | --- |

#### 

#### UC26: Deny Order

##### Use Case Description

| **Name** | **Deny Order** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to deny a purchase order received from a Buyer with a mandatory reason. The Buyer is notified of the denial and the reason within 30 seconds. The denial is recorded in the audit log. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff opens a purchase order in PENDING status and clicks the "Deny" button. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher. Target order exists with status PENDING and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Order status is updated to DENIED. Buyer receives an email notification with the denial reason within < 30 s. Denial is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-186 | **Order Status Pre-Check:** System verifies current status is PENDING: SELECT status FROM Orders WHERE id = @OrderID AND workspace_id = @WS_ID. If not PENDING, denial is rejected. |
| --- | --- | --- |
| (3) | BR-187 | **Mandatory Denial Reason:** System presents MSG-86 confirmation modal with a required text input. \[btnConfirmDenial\] remains disabled until the reason field contains at least 1 non-whitespace character. If blank on interaction, display MSG-85. Reason is stored with the order record. |
| --- | --- | --- |
| (5) | BR-188 | **State Transition with Guard:** Execute: UPDATE Orders SET status='DENIED', denied_by=@UserID, denied_at=UTC_TIMESTAMP(), denial_reason=@Reason WHERE id=@OrderID AND status='PENDING'. The AND status='PENDING' guard prevents concurrent denials. |
| --- | --- | --- |
| (7) | BR-189 | **Buyer Notification SLA & Audit Logging:** System publishes EVENT_ORDER_DENIED. INF-SVC-01 dispatches email to Buyer including denial reason within < 30s. Record into System_Audit: { action: "DENY_ORDER", actor: @UserID, target: @OrderID, metadata: { reason: @Reason } }. Trigger MSG-87 on success. |
| --- | --- | --- |

#### 

#### UC27: Assign Order Task

##### Use Case Description

| **Name** | **Assign Order Task** |
| --- | --- |
| **Description** | This use case allows a Supplier Manager to assign ownership of a purchase order to a specific active Sales Staff member within the same workspace. The assignment establishes clear accountability for order processing. The assigned staff member is notified immediately. |
| --- | --- |
| **Actor** | Supplier Manager |
| --- | --- |
| **Trigger** | Supplier Manager opens an order detail page and selects a staff member from the "Assign To" dropdown. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_MANAGER or higher. Target order belongs to the user's workspace. Target assignee is an active employee within the same workspace. |
| --- | --- |
| **Post-condition** | Order is linked to the assigned staff member. Assignment is visible in the order detail page. Assignee receives a notification within < 30 s. Assignment is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (4) | BR-190 | **Assignee Eligibility Check:** System verifies: SELECT id FROM Users WHERE id=@AssigneeID AND workspace_id=@WS_ID AND is_active=1 AND role IN ('SUPPLIER_SALES_STAFF','SUPPLIER_MANAGER'). If not found, reject with MSG-88. Only active employees are selectable in the dropdown. |
| --- | --- | --- |
| (5) | BR-191 | **Assignment Persistence:** Execute: UPDATE Orders SET assigned_to=@AssigneeID, assigned_by=@ManagerID, assigned_at=UTC_TIMESTAMP() WHERE id=@OrderID AND workspace_id=@WS_ID. A single order can only have one active assignee; re-assignment overwrites the previous value. |
| --- | --- | --- |
| (7) | BR-192 | **Notification SLA & Visibility:** System publishes EVENT_ORDER_ASSIGNED. INF-SVC-01 delivers in-app push notification and email to assignee with order summary and direct link within < 30s. Assigned name is displayed on order list row and detail page. Assignee sees order in "My Tasks" view. \| Audit Logging & Success Feedback: Record into System_Audit: { action: "ASSIGN_ORDER", actor: @ManagerID, target: @OrderID, metadata: { assigned_to: @AssigneeID } }. Trigger MSG-89 on success. |
| --- | --- | --- |
| (6) | BR-193 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "ASSIGN_ORDER", actor: @ManagerID, target: @OrderID, metadata: { assigned_to: @AssigneeID } }. Trigger MSG-89 on success. |
| --- | --- | --- |

####   
UC28: Reassign Order Task

##### Use Case Description

| **Name** | **Reassign Order Task** |
| --- | --- |
| **Description** | This use case allows a Supplier Manager to reassign an existing order task from the currently assigned Sales Staff member to another active Sales Staff member within the same workspace. This ensures work continuity when the current assignee becomes unavailable. The previous assignee's information and full assignment history are preserved for accountability. Both the old and new assignees are notified immediately. |
| --- | --- |
| **Actor** | Supplier Manager |
| --- | --- |
| **Trigger** | Supplier Manager opens an order detail page where a staff member is already assigned, and selects a different staff member from the "Reassign To" dropdown. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_MANAGER or higher.Target order belongs to the user's workspace.Target order already has an existing active assignee.New assignee is an active employee within the same workspace and different from the current assignee. |
| --- | --- |
| **Post-condition** | Order is reassigned to the new staff member. Previous assignee history is preserved in the audit log and assignment history table. New assignee receives a notification within < 30 s. Previous assignee receives a notification that the task has been reassigned. Reassignment is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | 194 | **Manager Role Enforcement:** Only users with role SUPPLIER_MANAGER or higher may perform reassignment. Enforced at API layer. The reassign control is not rendered in the UI for non-manager roles. |
| --- | --- | --- |
| (3) | 195 | **Existing Assignment Prerequisite:** System verifies: SELECT assigned_to FROM Orders WHERE id=@OrderID AND workspace_id=@WS_ID AND assigned_to IS NOT NULL. If no current assignee exists, system routes to Assign Order Task flow (UC27) instead of Reassign. |
| --- | --- | --- |
| (4) | 196 | **Same-Person Reassignment Guard:** System verifies new assignee is different from current assignee: IF @NewAssigneeID = @CurrentAssigneeID THEN reject with inline MSG-90. Prevents no-op reassignments from polluting assignment history. |
| --- | --- | --- |
| (6) | 197 | **Assignment History Preservation:** Before updating the order, system inserts a history record: INSERT INTO Order_Assignment_History (order_id, assigned_to, assigned_by, assigned_at, unassigned_at, unassigned_by) VALUES (@OrderID, @PreviousAssigneeID, @PreviousManagerID, @PreviousAssignedAt, UTC_TIMESTAMP(), @ManagerID). Orders.assigned_to is never overwritten without archiving previous value. |
| --- | --- | --- |
| (7) | 198 | **Reassignment Persistence:** Execute: UPDATE Orders SET assigned_to=@NewAssigneeID, assigned_by=@ManagerID, assigned_at=UTC_TIMESTAMP() WHERE id=@OrderID AND workspace_id=@WS_ID. Only one active assignee per order at any time. |
| --- | --- | --- |
| (9) | 199 | **Dual Notification SLA & Audit:** System publishes EVENT_ORDER_REASSIGNED. INF-SVC-01 delivers push+email to new assignee (with order summary and link) AND to previous assignee (informing transfer). Both notifications within < 30s. Record into System_Audit: { action: "REASSIGN_ORDER", previous_assignee: @PreviousAssigneeID, new_assignee: @NewAssigneeID }. Trigger MSG-91 on success. |
| --- | --- | --- |

#### 

#### UC29: View My Assigned Task

##### Use Case Description

| **Name** | **View My Assigned Task** |
| --- | --- |
| **Description** | This use case allows an authenticated Supplier Staff member to view a personalized list of purchase orders assigned exclusively to them. The dashboard provides a filtered, sorted view of their task queue, enabling focused work management. Supplier Managers and higher roles can also view all tasks within their workspace scope. |
| --- | --- |
| **Actor** | Supplier Staff, Supplier Manager (expanded scope) |
| --- | --- |
| **Trigger** | User navigates to the "My Tasks" section from the main navigation or dashboard. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher.Workspace is ACTIVE with the Supplier role enabled. |
| --- | --- |
| **Post-condition** | Filtered task list is displayed. Results reflect the current assignment state at query time. Access is strictly scoped per business rules. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-200 | **Role-Based Scope Enforcement:** SUPPLIER_SALES_STAFF: query strictly filtered by assigned_to=@CurrentUserID. SUPPLIER_MANAGER+: all orders in workspace without the assigned_to filter. This scoping is enforced at the API layer and cannot be bypassed via query parameters. \| Cross-Staff Visibility Prohibition: A SUPPLIER_SALES_STAFF user must never see orders assigned to other staff, even by manipulating API parameters. WHERE assigned_to=@CurrentUserID is enforced at the DB query level, not only UI. If no results match, display MSG-92. |
| --- | --- | --- |
| (3) | BR-201 | **Default Sort Order:** Tasks are sorted by composite priority: first by status priority (PENDING > NEGOTIATING > APPROVED > others), then by created_at ASC. Users can manually override sort to: created_at DESC, total_value DESC, or status ASC. |
| --- | --- | --- |
| (4) | BR-202 | **Visible Task Statuses:** "My Tasks" view displays orders in non-terminal statuses: PENDING, NEGOTIATING, APPROVED, PENDING_CREDIT_APPROVAL. Terminal statuses (DENIED, CONFIRMED, DELIVERED, CANCELLED) excluded by default. Users may opt in via "Show Completed" toggle. |
| --- | --- | --- |
| (5) | BR-203 | **Task Card Data Requirements**: Each row must display: order_id, buyer_name, total_value, status (color-coded badge), assigned_at, and direct link to order detail. Missing or null fields display as "—" and must not cause row render failure. |
| --- | --- | --- |

#### 

#### UC30: Negotiate Price Rounds

##### Use Case Description

| **Name** | **Negotiate Price** |
| --- | --- |
| **Description** | This use case allows Supplier Sales Staff and a Buyer to conduct multi-round price negotiations for a specific order. Each submitted negotiation round is immutable once sent. Both parties can view the full negotiation history at any time. Status updates are pushed to both parties within 30 seconds of each submission. |
| --- | --- |
| **Actor** | Supplier Sales Staff, Buyer Staff |
| --- | --- |
| **Trigger** | A participant submits a new negotiation round (quotation or counter-offer) within the negotiation thread of an order. |
| --- | --- |
| **Pre-condition** | User is authenticated as either SUPPLIER_SALES_STAFF (assigned to the order) or BUYER_STAFF (the Buyer who placed the order). Order exists with status NEGOTIATING. |
| --- | --- |
| **Post-condition** | New negotiation round is persisted and immutable. Both parties receive a status update notification within < 30 s. The negotiation thread reflects the new round immediately. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-204 | **Participant Authorization:** System verifies the submitting user is either the Supplier assigned to the order or the Buyer who created the order: SELECT \* FROM Orders WHERE id = @OrderID AND (supplier_workspace_id = @WS_ID OR buyer_user_id = @UserID). Unauthorized users receive HTTP 403. |
| --- | --- | --- |
| (5) | BR-205 | **Round Immutability Enforcement:** Once a negotiation round is inserted into Negotiation_Rounds, no UPDATE or DELETE is permitted on that record by any role, including System Admin. The database table enforces append-only via revoked write permissions on existing rows. |
| --- | --- | --- |
| (4) | BR-206 | **Round Data Requirements:** Each round must contain: order_id, submitted_by, \`role (SUPPLIER) |
| --- | --- | --- |
| (3) | BR-207 | **Alternating Turn Enforcement:** After a Supplier submits a round, only the Buyer may submit the next round, and vice versa. System checks: SELECT role FROM Negotiation_Rounds WHERE order_id = @OrderID ORDER BY submitted_at DESC LIMIT 1. If the last round was submitted by the same role as the current requester, request is rejected: _"It is the other party's turn to respond."_ |
| --- | --- | --- |
| (7) | BR-208 | **Notification SLA & Success Feedback:** System publishes EVENT_NEGOTIATION_ROUND_SUBMITTED. INF-SVC-01 delivers push notification and email to counterparty within < 30s. Trigger MSG-95 on success. |
| --- | --- | --- |
| (8) | BR-209 | **Multi-Supplier RFQ Closure:** Multi-Supplier RFQ Closure: If Buyer finalizes with one Supplier (UC31), all other open negotiation threads for that RFQ are automatically closed with status CLOSED_BY_BUYER. No further round submissions accepted on closed threads. |
| --- | --- | --- |

#### 

#### UC31: Finalize Order Terms

##### Use Case Description

| **Name** | **Negotiate Price** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to finalize and permanently lock an order after both parties have reached agreement through negotiation. Once finalized, all order terms (price, quantity, payment terms, delivery date) are permanently immutable and cannot be changed by any role. Both parties are notified. The system triggers an automatic reputation score update upon order eventual completion. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff clicks "Finalize Order" after the Buyer has accepted the latest negotiation round. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher.Order status is NEGOTIATING.The Buyer has submitted an acceptance on the latest negotiation round. |
| --- | --- |
| **Post-condition** | Order status is updated to CONFIRMED and permanently locked. Both parties receive confirmation notification. Finalization is recorded in audit log. Reputation score update is queued for post-completion execution. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-210 | B**uyer Acceptance Prerequisite:** System verifies the most recent Negotiation_Rounds entry has accepted_by_buyer=1. If not, \[btnFinalize\] is disabled and the API rejects the request with HTTP 409 and MSG-96. |
| --- | --- | --- |
| (5) | BR-211 | **Order Lock — Permanent Immutability:** Execute: UPDATE Orders SET status='CONFIRMED', confirmed_by=@UserID, confirmed_at=UTC_TIMESTAMP(), is_locked=1. Once is_locked=1, no field on the order record can be modified by any role. Constraint enforced at application service layer and DB via trigger. |
| --- | --- | --- |
| (4) | BR-212 | **Agreed Terms Snapshot:** System copies finalized terms from the accepted negotiation round into Orders fields: final_unit_price, final_payment_terms, final_delivery_date. This snapshot is the authoritative record for invoicing and dispute resolution. |
| --- | --- | --- |
| (7) | BR-213 | **Notification to Both Parties SLA:** System publishes EVENT_ORDER_CONFIRMED. INF-SVC-01 delivers confirmation notification to both Supplier and Buyer with locked terms summary within < 30s. |
| --- | --- | --- |
| (8) | BR-214 | **Reputation Score Update Trigger & Audit:** Upon order eventual completion (status → DELIVERED), system publishes EVENT_ORDER_COMPLETED to reputation scoring service. Score recalculated asynchronously — does not block finalization. Record into System_Audit: { action: "FINALIZE_ORDER", final_price, delivery_date }. Trigger MSG-98 on success. |
| --- | --- | --- |

##### 

#### UC32: Respond To RFQ

##### Use Case Description

| **Name** | **Respond To RFQ** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to review an incoming Request for Quotation (RFQ) and submit a formal quotation with pricing and delivery terms. The Supplier may save a draft before submission. Once submitted, the quotation is immutable and the Buyer is notified. Suppliers can only view and respond to RFQs assigned to their workspace. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff opens an RFQ in "Pending Response" status and submits a quotation form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher.Target RFQ exists and is assigned to the user's workspace.RFQ status is PENDING_RESPONSE. |
| --- | --- |
| **Post-condition** | Quotation is persisted. RFQ status transitions to RESPONDED. Buyer is notified. Submitted quotation is immutable. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-215 | **Workspace RFQ Isolation:** Suppliers can only view and respond to RFQs assigned to their workspace: SELECT \* FROM RFQs WHERE id=@RFQID AND assigned_supplier_workspace_id=@WS_ID. Any attempt to access an RFQ from another workspace returns HTTP 403 and trigger MSG-99. |
| --- | --- | --- |
| (2) | BR-216 | **Status Pre-Check:** System verifies RFQ status is PENDING_RESPONSE before allowing submission. If not PENDING_RESPONSE, the submit action is rejected. Draft saving is allowed in any non-terminal status. |
| --- | --- | --- |
| (3) | BR-217 | **Quotation Fields Validation:** Supplier must provide per-item: unit_price (positive number), quantity_available, delivery_terms, estimated_delivery_date, and optional notes. All monetary fields validated as positive numbers before acceptance. |
| --- | --- | --- |
| (4) | BR-218 | **Draft Save:** Supplier may save a quotation as DRAFT at any time without full validation. Draft quotations do not trigger notifications and do not change the RFQ status. Only one draft per Supplier per RFQ is retained; subsequent saves overwrite previous. Trigger MSG-101 on draft save. |
| --- | --- | --- |
| (6) | BR-219 | **Quotation Immutability on Submit:** Once submitted (status=SUBMITTED), the quotation record is immutable. No UPDATE or DELETE permitted by any role. Enforced at DB layer (append-only). |
| --- | --- | --- |
| (7) | BR-220 | **RFQ Status Transition, Notification SLA & Audit:** Execute: UPDATE RFQs SET status='RESPONDED', responded_at=UTC_TIMESTAMP(). System publishes EVENT_RFQ_RESPONDED. INF-SVC-01 delivers push+email to Buyer within < 30s. Trigger MSG-100 on success. |
| --- | --- | --- |

##### 

#### UC33: Create Fixed Price List

##### Use Case Description

| **Name** | **Create Fixed Price List** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to create a named, structured fixed price list (e.g., Wholesale, Retail, VIP) containing product-to-price mappings. Once created, the price list can be assigned to specific Buyer partners. New prices defined in the list are automatically applied to future quotations for assigned partners without requiring code changes. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff clicks "Create Price List" and submits the price list form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher.Workspace is ACTIVE with Supplier role enabled.At least one active product exists in the workspace catalog. |
| --- | --- |
| **Post-condition** | Price list is persisted and available for partner assignment. Future quotations for assigned Buyers automatically reference the new prices. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-221 | **Price List Name Uniqueness:** System checks name uniqueness within workspace on blur/onChange: SELECT COUNT(\*) FROM PriceLists WHERE workspace_id=@WS_ID AND name=@Name AND is_active=1. If count > 0, show inline MSG-102 and disable \[btnSave\]. |
| --- | --- | --- |
| (4) | BR-222 | **Price Validity Constraint**: All unit_price values must be positive numbers greater than zero. System rejects any entry with unit_price <= 0 with field-level validation error. |
| --- | --- | --- |
| (3) | BR-223 | **Mandatory Fields Validation:** Required: name, price_list_type (WHOLESALE, RETAIL, or VIP), and at least one product-price mapping. Each mapping requires product_id and unit_price (positive number > 0). If any mandatory field invalid on submit, display MSG-103. |
| --- | --- | --- |
| (5) | BR-224 | **Persistence:** Execute: INSERT INTO PriceLists (workspace_id, name, type, description, created_by, created_at). Then batch insert: INSERT INTO PriceList_Items (price_list_id, product_id, unit_price) for each mapping. |
| --- | --- | --- |
| (6) | BR-225 | **No-Code Price Application:** When a Buyer assigned to this price list submits an RFQ or order, system automatically populates reference_price from the matching PriceList_Items entry at quotation generation time. If a product is not in the assigned price list, system falls back to catalog reference_price. |
| --- | --- | --- |
| (7  | BR-226 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "CREATE_PRICE_LIST", actor: @UserID, target: @PriceListID, metadata: { name: @Name, type: @Type, item_count: @Count } }. Trigger MSG-104 on success. |
| --- | --- | --- |

##### 

#### UC34: Assign Price List To Partners

##### Use Case Description

| **Name** | **Assign Price List To Partners** |
| --- | --- |
| **Description** | This use case allows a Supplier Sales Staff member to assign a specific fixed price list to one or more Buyer partners. Once assigned, the price list takes effect immediately for all future quotations and orders from the assigned Buyer. Existing confirmed orders are not retroactively affected. |
| --- | --- |
| **Actor** | Supplier Sales Staff |
| --- | --- |
| **Trigger** | Supplier Sales Staff navigates to a Buyer partner profile or the Price List management page and assigns a price list. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_SALES_STAFF or higher.Target Buyer workspace is an active partner of the Supplier workspace.Target price list is active and belongs to the Supplier's workspace. |
| --- | --- |
| **Post-condition** | Price list assignment is persisted. Assignment takes effect immediately for future quotations. Existing confirmed orders remain unaffected. Assignment is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-227 | **Partner Eligibility Check:** System verifies: SELECT id FROM Workspace_Partnerships WHERE supplier_workspace_id=@WS_ID AND buyer_workspace_id=@BuyerWS_ID AND status='ACTIVE'. If not found, reject with HTTP 403. |
| --- | --- | --- |
| (3) | BR-228 | **Price List Ownership Verification:** System verifies: SELECT workspace_id FROM PriceLists WHERE id=@PriceListID. If workspace_id != @WS_ID, reject with HTTP 403. |
| --- | --- | --- |
| (4) | BR-229 | **Single Assignment Per Buyer & Replacement Flow:** A Buyer partner can only have one active price list per Supplier. If already assigned, system displays MSG-105 for replacement confirmation. On confirm, previous assignment is overwritten; assignment history is preserved. |
| --- | --- | --- |
| (5) | BR-230 | **Immediate Effect on Future Quotes:** Execute: INSERT INTO Buyer_PriceList_Assignments (supplier_workspace_id, buyer_workspace_id, price_list_id, assigned_by, assigned_at). All RFQs and quotations generated after this timestamp for this Buyer automatically use the assigned price list pricing. |
| --- | --- | --- |
| (6) | BR-231 | **Confirmed Order Immutability Safeguard:** Assigning or changing a price list must not alter any order with is_locked=1. System applies new price list only to records created_at >= assignment timestamp. |
| --- | --- | --- |
| (7) | BR-232 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "ASSIGN_PRICE_LIST", actor: @UserID, target: @BuyerWS_ID, metadata: { price_list_id: @PriceListID } }. Trigger MSG-106 on success. |
| --- | --- | --- |

##### 

#### UC35: Set Credit Limit Per Buyer

##### Use Case Description

| **Name** | **Set Credit Limit Per Buyer** |
| --- | --- |
| **Description** | This use case allows a Supplier Chief Accountant to define or update a credit limit for a specific Buyer partner. The credit limit controls the maximum outstanding receivable balance the Supplier will extend to the Buyer. Orders exceeding the credit limit are automatically blocked and routed for manual approval. Every credit limit change is recorded in the audit log with old and new values. |
| --- | --- |
| **Actor** | Supplier Chief Accountant |
| --- | --- |
| **Trigger** | Supplier Chief Accountant navigates to a Buyer partner's credit profile and sets or updates the credit limit value. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_CHIEF_ACCOUNTANT or higher.Target Buyer is an active partner of the Supplier workspace. |
| --- | --- |
| **Post-condition** | Credit limit is persisted and immediately effective. Credit limit is visible on the Buyer's profile. Change is recorded in audit log with old and new values. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-233 | **Role Enforcement:** Only SUPPLIER_CHIEF_ACCOUNTANT or higher may set or modify a Buyer's credit limit. Enforced at API layer. Credit limit input field is not rendered in the UI for unauthorized roles. If unauthorized API call, return HTTP 403. |
| --- | --- | --- |
| (3) | BR-234 | **Credit Limit Value Constraint:** The credit limit must be a non-negative number (zero or greater). Zero = no credit, Buyer pays upfront. System rejects negative values with MSG-107. |
| --- | --- | --- |
| (5) | BR-235 | **Persistence with History:** Before updating, system archives old value: INSERT INTO CreditLimit_History (buyer_workspace_id, supplier_workspace_id, old_limit, new_limit, changed_by, changed_at). Then: UPDATE Buyer_CreditLimits SET credit_limit=@NewLimit, updated_by=@UserID, updated_at=UTC_TIMESTAMP(). |
| --- | --- | --- |
| (6) | BR-236 | **Immediate Enforcement:** New credit limit takes effect immediately for all subsequent order evaluations (UC25 BR-184). Orders in terminal statuses (CONFIRMED, DELIVERED) are not affected. |
| --- | --- | --- |
| (7) | BR-237 | **Credit Limit Visibility & Audit:** Current credit limit and outstanding balance displayed on Buyer partner's profile page; visible only to SUPPLIER_CHIEF_ACCOUNTANT and SUPPLIER_MANAGER. Record into System_Audit: { action: "SET_CREDIT_LIMIT", old_limit, new_limit }. Trigger MSG-108 on success. |
| --- | --- | --- |

##### 

#### UC36: Approve Credit Limit Bypass

##### Use Case Description

| **Name** | **Approve Credit Limit Bypass** |
| --- | --- |
| **Description** | This use case allows a Supplier Chief Accountant to review and approve an exception for a purchase order that has exceeded the Buyer's assigned credit limit. The bypass allows strategic or high-value orders to proceed despite the credit constraint. A mandatory reason must be provided. The Buyer is notified of the approval outcome within 30 seconds. |
| --- | --- |
| **Actor** | Supplier Chief Accountant |
| --- | --- |
| **Trigger** | A purchase order transitions to PENDING_CREDIT_APPROVAL status (triggered automatically by UC-SUP-21 BR-120), and the Chief Accountant opens the approval queue and acts on the request. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_CHIEF_ACCOUNTANT or higher.Target order exists with status PENDING_CREDIT_APPROVAL and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Order status transitions to APPROVED. Bypass decision is recorded with the provided reason. Buyer is notified within < 30 s. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-238 | **Order Status Pre-Check & Role Enforcement:** System verifies order status is PENDING_CREDIT_APPROVAL. Only SUPPLIER_CHIEF_ACCOUNTANT or higher may access or act on this queue. Non-authorized roles cannot see or act on it. Unauthorized API call returns HTTP 403. |
| --- | --- | --- |
| (4) | BR-239 | **Mandatory Bypass/Denial Reason:** System presents MSG-110 confirmation modal requiring a bypass justification. \[btnConfirm\] remains disabled until reason field contains at least 1 non-whitespace character. If empty on submit attempt, display MSG-109. Reason stored permanently in Orders.credit_bypass_reason. |
| --- | --- | --- |
| (7) | BR-240 | **Notification SLA & Audit:** System publishes EVENT_CREDIT_BYPASS_DECIDED. INF-SVC-01 dispatches email and in-app push to Buyer with approval or denial reason within < 30s. Record into System_Audit: { action: "APPROVE_CREDIT_BYPASS" \| "DENY_CREDIT_BYPASS", reason, buyer_id }. Trigger MSG-111 (approve) or MSG-112 (deny). |
| --- | --- | --- |

##### 

#### UC37: Issue E-Warehouse Receipt

##### Use Case Description

| **Name** | **Issue E-Warehouse Receipt** |
| --- | --- |
| **Description** | This use case allows a Supplier Accountant to issue an electronic warehouse receipt formally recording the receipt of goods linked to a specific purchase order. Once issued, the receipt is immediately locked and immutable. Any correction requires issuing a separate Cancellation Receipt with a mandatory reason, preserving an append-only ledger of all warehouse transactions. |
| --- | --- |
| **Actor** | Supplier Accountant |
| --- | --- |
| **Trigger** | Supplier Accountant opens a confirmed order and clicks "Issue Warehouse Receipt". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_ACCOUNTANT or higher.Target order exists with status CONFIRMED or APPROVED and belongs to the user's workspace.No duplicate active warehouse receipt exists for the same order. |
| --- | --- |
| **Post-condition** | Warehouse receipt is persisted with status ISSUED and immediately locked. Receipt is linked to the corresponding order. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-241 | **Order Status Pre-Check:** System verifies target order is CONFIRMED or APPROVED: SELECT status FROM Orders WHERE id=@OrderID AND workspace_id=@WS_ID. Only CONFIRMED or APPROVED orders are eligible. PENDING, DENIED, or already DELIVERED orders are rejected. |
| --- | --- | --- |
| (3) | BR-242 | **Duplicate Receipt Prevention:** System checks: SELECT COUNT(\*) FROM WarehouseReceipts WHERE order_id=@OrderID AND status='ISSUED'. If count > 0, display MSG-113 and block issuance. Only one active receipt per order is permitted. |
| --- | --- | --- |
| (4) | BR-243 | **Mandatory Receipt Fields:** Required fields: order_id, received_quantity (positive number), received_by, received_at (UTC_TIMESTAMP), warehouse_location, goods_condition (GOOD/DAMAGED/PARTIAL). If any missing, display MSG-114 and block submission. |
| --- | --- | --- |
| (5) | BR-244 | **Immediate Immutability on Issuance:** Upon creation, system sets is_locked=1. Execute: INSERT INTO WarehouseReceipts, then UPDATE WarehouseReceipts SET is_locked=1. No UPDATE or DELETE permitted by any role after lock. |
| --- | --- | --- |
| (7) | BR-245 | **Cancellation Receipt Flow & Audit:** To correct a receipt, Accountant creates a Cancellation Receipt: INSERT WITH type='CANCELLATION', references_receipt_id=@OriginalID, reason=@Reason (mandatory; display MSG-116 if blank). Original receipt status set to CANCELLED (is_locked maintained). Ledger is append-only. Record into System_Audit: { action: "ISSUE_WAREHOUSE_RECEIPT" \| "CANCEL_WAREHOUSE_RECEIPT" }. Trigger MSG-115 (issue) or MSG-117 (cancel). |
| --- | --- | --- |

##### 

#### UC38: Record Payment Receipt

##### Use Case Description

| **Name** | **Record Payment Receipt** |
| --- | --- |
| **Description** | This use case allows a Supplier Accountant to record a payment receipt against a specific invoice, updating the accounts receivable balance. Upon successful matching of a payment receipt to an invoice, the Buyer's credit limit is automatically restored by the paid amount within 3 seconds. No manual ledger update is required. |
| --- | --- |
| **Actor** | Supplier Accountant |
| --- | --- |
| **Trigger** | Supplier Accountant opens an outstanding invoice and records a payment receipt with the received payment details. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_ACCOUNTANT or higher.Target invoice exists, belongs to the user's workspace, and has outstanding balance > 0. |
| --- | --- |
| **Post-condition** | Payment receipt is persisted and matched to the invoice. Accounts receivable balance is updated. Buyer's credit limit is automatically restored by the paid amount within < 3 s. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-246 | **Invoice Matching Requirement:** Each payment receipt must be matched to a single valid invoice: SELECT id FROM Invoices WHERE id=@InvoiceID AND workspace_id=@WS_ID AND outstanding_balance > 0. If invoice not found or balance is zero, display MSG-118 and block submission. |
| --- | --- | --- |
| (3) | BR-247 | **Mandatory Receipt Fields**: Required: invoice_id, payment_amount (positive, <= outstanding_balance), payment_date, payment_method (BANK_TRANSFER/CASH/CHECK), reference_number. Notes optional. |
| --- | --- | --- |
| (4) | BR-248 | **Overpayment Prevention:** System validates payment_amount &lt;= invoice.outstanding_balance. If payment_amount &gt; outstanding_balance, display MSG-119 and block submission. |
| --- | --- | --- |
| (5) | BR-249 | **Accounts Receivable Update:** Execute: UPDATE Invoices SET outstanding_balance = outstanding_balance - @PaymentAmount, status = CASE WHEN (outstanding_balance - @PaymentAmount) = 0 THEN 'PAID' ELSE 'PARTIALLY_PAID' END WHERE id=@InvoiceID. Then: INSERT INTO PaymentReceipts. |
| --- | --- | --- |
| (6) | BR-250 | **Automatic Credit Limit Restoration (SLA):** Upon successful payment recording, system automatically executes: UPDATE Buyer_CreditLimits SET outstanding_balance = outstanding_balance - @PaymentAmount WHERE buyer_workspace_id=@BuyerWS_ID AND supplier_workspace_id=@WS_ID. Constraint: credit restoration must complete within < 3s. No manual action required. |
| --- | --- | --- |
| (7) | BR-251 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "RECORD_PAYMENT_RECEIPT", target: @ReceiptID, invoice_id: @InvoiceID, amount: @Amount, credit_restored: true }. Trigger MSG-120 on success. |
| --- | --- | --- |

##### 

#### UC39: Clear Debt Via 3-Way Matching

##### Use Case Description

| **Name** | **Clear Debt Via 3-Way Matching** |
| --- | --- |
| **Description** | This use case allows a Supplier Chief Accountant to perform a 3-way matching process comparing a Purchase Order (PO), a Warehouse Receipt, and an Invoice to verify consistency before clearing payment. The system presents a side-by-side comparison dashboard highlighting discrepancies. If discrepancies exist, a mandatory justification is required. Upon confirmation, the order is marked as Cleared, accounts receivable is updated, all linked documents are permanently locked, and the Buyer's credit limit is unlocked. Access is strictly restricted to authorized parties. |
| --- | --- |
| **Actor** | Supplier Chief Accountant |
| --- | --- |
| **Trigger** | Supplier Chief Accountant opens the 3-way matching screen for a specific order from the finance management dashboard. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: SUPPLIER_CHIEF_ACCOUNTANT or higher, or is the assigned accountant or involved Buyer for this order.Order exists with a linked warehouse receipt (status ISSUED) and a linked invoice (status FINALIZED).Order has not already been matched (status != CLEARED). |
| --- | --- |
| **Post-condition** | Order status changes to CLEARED. Accounts receivable is updated. All linked documents (PO, receipt, invoice) are permanently locked (is_locked = 1). Buyer's credit limit outstanding balance is reduced by the cleared amount. All matching details are recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-252 | **Access Control — Authorized Parties Only:** Only the assigned SUPPLIER_CHIEF_ACCOUNTANT, the assigned SUPPLIER_ACCOUNTANT for this order, and the BUYER_STAFF who placed the order may access. Unauthorized users receive HTTP 403. Enforced at API layer. |
| --- | --- | --- |
| (3) | BR-253 | **Comparison Dashboard Load:** System retrieves side-by-side data from Orders (PO quantity, unit price, total), WarehouseReceipts (received quantity, goods condition), and Invoices (billed quantity, unit price, total). Performance constraint: all three sources must load within < 5s. |
| --- | --- | --- |
| (4) | BR-254 | **Automatic Discrepancy Highlighting:** System compares quantity and unit_price fields across the three documents. Any field where values do not match is highlighted in yellow. The system calculates and displays a discrepancy summary row showing variance amounts. |
| --- | --- | --- |
| (5) | BR-255 | **Mandatory Discrepancy Justification:** If any discrepancy is detected (any highlighted field), system requires a mandatory Discrepancy Justification before \[btnConfirmMatch\] becomes active. If empty on submit attempt, display MSG-122. Justification must contain at least 1 non-whitespace character. |
| --- | --- | --- |
| (6) | BR-256 | **Manual Confirmation Required:** \[btnConfirmMatch\] requires an explicit manual click. The system cannot auto-confirm even when all values are equal. MSG-121 confirmation dialog is shown: "Confirm 3-way match for Order \[ID\]? This action is irreversible." |
| --- | --- | --- |
| (7) | BR-257 | **Post-Confirmation Atomic State Transitions:** Execute in a single transaction: (a) UPDATE Orders SET status='CLEARED', matched_by=@UserID, matched_at=UTC_TIMESTAMP(), is_locked=1. (b) UPDATE WarehouseReceipts SET is_locked=1 WHERE order_id=@OrderID. (c) UPDATE Invoices SET is_locked=1 WHERE order_id=@OrderID. (d) UPDATE Buyer_CreditLimits SET outstanding_balance -= @ClearedAmount. All four must succeed atomically; partial execution is rolled back. |
| --- | --- | --- |
| (8) | BR-258 | **Matching Status Values:** Matching records must include one of three status values: MATCHED (all values agree), MISMATCHED (discrepancies exist, justification provided), or APPROVED_WITH_EXCEPTION (manual override with documented reason). |
| --- | --- | --- |
| (9) | BR-259 | **Permanent Document Immutability:** After confirmation, no role — including System Admin and Platform Admin — may modify the PO, warehouse receipt, or invoice records. Enforced at DB layer via row-level locking and audit trigger. |
| --- | --- | --- |
| (10) | BR-260 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: "CONFIRM_3WAY_MATCHING", target: @OrderID, metadata: { matching_status: @Status, justification: @Justification, documents_locked: \[@OrderID, @ReceiptID, @InvoiceID\] } }. Trigger MSG-123 on success. |
| --- | --- | --- |

#### 

### Carrier

#### UC40: Create Vehicle Profile

##### Use Case Description

| **Name** | **Create Vehicle Profile** |
| --- | --- |
| **Description** | This use case allows a Carrier Staff member to create a new vehicle profile within their workspace. The profile captures all mandatory identification and capacity details required for dispatch eligibility. Upon successful creation, the vehicle is immediately available in the dispatcher's vehicle selection dropdown. |
| --- | --- |
| **Actor** | Carrier Staff |
| --- | --- |
| **Trigger** | Carrier Staff clicks "Add Vehicle" on the Fleet Management page and submits the vehicle creation form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_STAFF or higher.Workspace is ACTIVE with the Carrier role enabled. |
| --- | --- |
| **Post-condition** | Vehicle profile is persisted and immediately visible in the dispatch vehicle dropdown. Profile is linked to the workspace. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-261 | **License Plate Uniqueness (Real-Time):** On blur of \[txtLicensePlate\], system calls GET /vehicles/check-plate. Query: SELECT COUNT(\*) FROM Vehicles WHERE workspace_id=@WS_ID AND license_plate=@Plate AND is_active=1. If count > 0: show MSG-124 inline and disable \[btnSave\]. |
| --- | --- | --- |
| (3) | BR-262 | **Mandatory Field Validation:** Required fields: license_plate, vehicle_type, capacity_value (positive number), capacity_unit, workspace_id. Validated at both UI and API layers. Action: If any mandatory field is empty or invalid on submit, display MSG-125 and block submission. |
| --- | --- | --- |
| (4) | BR-263 | **Default Status on Creation:** Upon successful creation, vehicle is assigned status=ACTIVE and is_available=1. Execute: INSERT INTO Vehicles (workspace_id, license_plate, vehicle_type, capacity_value, capacity_unit, status, is_available, created_by, created_at) VALUES (...). |
| --- | --- | --- |
| (6) | BR-264 | **Immediate Dispatch Availability:** After insertion, system publishes EVENT_VEHICLE_CREATED. The vehicle appears immediately in the dispatcher's dropdown (WHERE is_available=1 AND status='ACTIVE') within < 1s without page reload. Trigger MSG-126 on success. |
| --- | --- | --- |
| ()  | BR-265 | **Audit Logging:** Record into System_Audit: { action: 'CREATE_VEHICLE', actor: @UserID, target: @VehicleID, metadata: { ip: @IP, timestamp: @TS, license_plate: @Plate, workspace_id: @WS_ID } }. |
| --- | --- | --- |

#### 

#### UC41: Update Vehicle Profile

##### Use Case Description

| **Name** | **Update Vehicle Profile** |
| --- | --- |
| **Description** | This use case allows a Carrier Staff member to update the details of an existing vehicle profile — including type, capacity, and operational notes. Changes are persisted immediately. License plate cannot be changed once created. Every update is recorded in the audit log. |
| --- | --- |
| **Actor** | Carrier Staff |
| --- | --- |
| **Trigger** | Carrier Staff clicks the edit icon on a vehicle row in the Fleet Management list and submits the updated form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_STAFF or higher.Target vehicle exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Vehicle profile is updated and changes are immediately visible in the fleet list and dispatch dropdown. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-266 | **Workspace Ownership Verification:** System verifies: SELECT workspace_id FROM Vehicles WHERE id=@VehicleID. If workspace_id != requesting user's workspace_id, reject with HTTP 403. |
| --- | --- | --- |
| (4) | BR-267 | **License Plate Immutability:** The license_plate field is read-only after creation. System renders it as disabled in the UI and rejects any API request that attempts to change it: IF @NewPlate != Vehicles.license_plate THEN REJECT WITH HTTP 400 and trigger MSG-127. |
| --- | --- | --- |
| (5) | BR-268 | **Update Persistence:** Execute: UPDATE Vehicles SET vehicle_type=@Type, capacity_value=@Cap, capacity_unit=@Unit, brand=@Brand, model=@Model, year=@Year, notes=@Notes, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@VehicleID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (5) | BR-269 | **Immediate Reflection:** Updated details appear immediately in the fleet management list and all dispatch-related dropdowns within < 1s without page reload. |
| --- | --- | --- |
| (6) | BR-270 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'UPDATE_VEHICLE', actor: @UserID, target: @VehicleID, metadata: { fields_changed: \[@FieldList\] } }. Trigger MSG-128 on success. |
| --- | --- | --- |

#### 

#### UC42: Monitor Vehicle Fleet

##### Use Case Description

| **Name** | **Monitor Vehicle Fleet** |
| --- | --- |
| **Description** | This use case allows a Carrier Operator to view a real-time status dashboard for all vehicles within their workspace. The dashboard displays each vehicle's current operational status (ACTIVE, INACTIVE, ON_TRIP, INCIDENT, MAINTENANCE) and allows the operator to monitor fleet availability at a glance. GPS pings are ingested every 30 seconds. Route history is stored immutably for a minimum of 5 years for dispute resolution. |
| --- | --- |
| **Actor** | Carrier Operator |
| --- | --- |
| **Trigger** | Carrier Operator navigates to the Fleet Monitoring dashboard. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_OPERATOR or higher.Workspace is ACTIVE with the Carrier role enabled. |
| --- | --- |
| **Post-condition** | Fleet dashboard is displayed with real-time status for all vehicles in the workspace. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-271 | **Workspace Isolation:** Dashboard query is strictly scoped to the requesting user's workspace: SELECT \* FROM Vehicles WHERE workspace_id=@WS_ID. Vehicles from other workspaces are never returned regardless of shared infrastructure. If no vehicles exist, display MSG-129. |
| --- | --- | --- |
| (2) | BR-272 | **Vehicle Status Values:** System displays one of five statuses per vehicle: ACTIVE (available), INACTIVE (deactivated), ON_TRIP (dispatched), INCIDENT (incident on active trip), MAINTENANCE (manually set, unavailable). Each status is rendered with a distinct color-coded badge. |
| --- | --- | --- |
| (3) | BR-273 | **Real-Time GPS Ingestion:** Fleet tracking service ingests GPS coordinates from each vehicle's onboard device at intervals of <= 30s. Each ping record includes: vehicle_id, latitude, longitude, speed, timestamp. Dashboard reflects latest ping position within 30s of actual vehicle position. |
| --- | --- | --- |
| (4) | BR-274 | **Route History Retention (Immutable):** All GPS ping records are stored in an append-only table (Vehicle_GPS_History). Mandatory retention period >= 5 years. No DELETE operations are permitted by any role. After 5 years, records may be archived to cold storage but must remain queryable for dispute resolution within < 10s of request. |
| --- | --- | --- |
| (2) | BR-275 | **Dashboard Performance:** Fleet monitoring dashboard must render the full vehicle list with latest status within < 3s of page load. Required indexes: (workspace_id, status) and (vehicle_id, timestamp DESC) for GPS history. |
| --- | --- | --- |

#### 

#### UC43: Toggle Vehicle Activation

##### Use Case Description

| **Name** | **Toggle Vehicle Activation** |
| --- | --- |
| **Description** | This use case allows a Carrier Staff member to activate or deactivate a vehicle in the fleet. Only roadworthy, active vehicles are visible in the dispatch dropdown. When a vehicle is deactivated, its current driver assignment is automatically removed and the vehicle is excluded from dispatch within 1 second without requiring a page reload. |
| --- | --- |
| **Actor** | Carrier Staff |
| --- | --- |
| **Trigger** | Carrier Staff clicks the activation toggle on a vehicle row in the Fleet Management list. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_STAFF or higher.Target vehicle exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Vehicle status is updated. If deactivated, vehicle is removed from dispatch dropdown within < 1 s and any active driver assignment is automatically cleared. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-276 | **Ownership Verification:** System verifies: SELECT workspace_id FROM Vehicles WHERE id=@VehicleID. If workspace_id != requesting user's workspace_id, reject with HTTP 403. |
| --- | --- | --- |
| (3) | BR-277 | **Toggle State Machine:** Allowed transitions: ACTIVE → INACTIVE and INACTIVE → ACTIVE. Execute: UPDATE Vehicles SET status=@NewStatus, is_available=CASE WHEN @NewStatus='ACTIVE' THEN 1 ELSE 0 END, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@VehicleID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (4) | BR-278 | **Automatic Driver Unassignment on Deactivation:** When toggling to INACTIVE, system checks: SELECT id FROM Driver_Vehicle_Assignments WHERE vehicle_id=@VehicleID AND is_active=1. If found: UPDATE Driver_Vehicle_Assignments SET is_active=0, unassigned_at=UTC_TIMESTAMP(), unassigned_reason='VEHICLE_DEACTIVATED'. UPDATE Drivers SET status='AVAILABLE' WHERE id=@DriverID. |
| --- | --- | --- |
| (5) | BR-279 | **Dispatch Dropdown Real-Time Update:** System publishes EVENT_VEHICLE_STATUS_CHANGED. Dispatch dropdown filters WHERE status='ACTIVE' AND is_available=1. Constraint: deactivated vehicle must disappear from dropdown within < 1s without page reload. |
| --- | --- | --- |
| (2) | BR-280 | **On-Trip Deactivation Guard:** If vehicle current status is ON_TRIP, system displays MSG-130 warning. Staff must acknowledge before proceeding. The toggle is not blocked by this warning. |
| --- | --- | --- |
| (6) | BR-281 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'TOGGLE_VEHICLE_ACTIVATION', actor: @UserID, target: @VehicleID, metadata: { new_status: @NewStatus, driver_unassigned: @DriverID\|null } }. Trigger MSG-131 on success. |
| --- | --- | --- |

#### 

#### UC44: Update Driver Profile

##### Use Case Description

| **Name** | **Update Driver Profile** |
| --- | --- |
| **Description** | This use case allows a Carrier HR member to update an existing driver's profile information, including contact details, license information, and operational notes. Changes are persisted immediately and reflected across all active sessions. Every update is recorded in the audit log. |
| --- | --- |
| **Actor** | Carrier HR |
| --- | --- |
| **Trigger** | Carrier HR opens a driver's profile page and submits the updated profile form. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_HR or higher.Target driver profile exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Driver profile is updated and changes are immediately visible in dispatch-related views. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-282 | **Workspace Ownership Verification:** System verifies: SELECT workspace_id FROM Drivers WHERE id=@DriverID. If workspace_id != requesting user's workspace_id, reject with HTTP 403. |
| --- | --- | --- |
| (3) | BR-283 | **Editable Fields Scope:** HR may update: full_name, phone_number, email, license_number, license_expiry_date, vehicle_type_preference, notes. The fields driver_id, workspace_id, and account_status are read-only and cannot be changed through this use case. |
| --- | --- | --- |
| (4) | BR-284 | **License Expiry Validation:** If license_expiry_date is updated, system validates the new date is strictly in the future (> today). If the date is today or in the past, display MSG-132 and block submission. |
| --- | --- | --- |
| (5) | BR-285 | **Update Persistence:** Execute: UPDATE Drivers SET full_name=@Name, phone_number=@Phone, license_number=@LicNum, license_expiry_date=@Expiry, notes=@Notes, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@DriverID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (6) | BR-286 | **Immediate Session Propagation:** System publishes EVENT_DRIVER_PROFILE_UPDATED. Updated driver name and contact details reflect in all active dispatch and fleet management views within < 1s without page reload. |
| --- | --- | --- |
| (7) | BR-287 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'UPDATE_DRIVER_PROFILE', actor: @UserID, target: @DriverID, metadata: { fields_changed: \[@FieldList\] } }. Trigger MSG-133 on success. |
| --- | --- | --- |

#### 

#### UC45: Assign Driver To Vehicle

##### Use Case Description

| **Name** | **Assign Driver To Vehicle** |
| --- | --- |
| **Description** | This use case allows a Dispatcher to assign an available driver to an available vehicle within the same workspace, creating an active driver-vehicle assignment. The assignment makes both the driver and vehicle ready for dispatch. Only one driver can be assigned to a vehicle at a time, and a driver can only hold one active vehicle assignment at a time. |
| --- | --- |
| **Actor** | Dispatcher |
| --- | --- |
| **Trigger** | Dispatcher opens the Driver-Vehicle Assignment page and selects an available driver and an available vehicle, then confirms the assignment. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_DISPATCHER or higher.Both the target driver and target vehicle exist and belong to the user's workspace.Both the driver and vehicle are in AVAILABLE / ACTIVE status with no existing active assignment. |
| --- | --- |
| **Post-condition** | Driver-vehicle assignment is persisted with status ACTIVE. Both driver and vehicle are marked as assigned. Assignment is recorded with timestamp. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-288 | **Driver Availability Check:** System verifies: SELECT COUNT(\*) FROM Driver_Vehicle_Assignments WHERE driver_id=@DriverID AND is_active=1. If count > 0, display MSG-134 and reject. Only drivers with status=AVAILABLE are shown in the selection dropdown. |
| --- | --- | --- |
| (3) | BR-289 | **Vehicle Availability Check:** System verifies: SELECT COUNT(\*) FROM Driver_Vehicle_Assignments WHERE vehicle_id=@VehicleID AND is_active=1. If count > 0, display MSG-135 and reject. Only vehicles with status=ACTIVE AND is_available=1 are shown in the dropdown. |
| --- | --- | --- |
| (4) | BR-290 | **One Active Assignment Per Entity:** A driver may hold exactly one active vehicle assignment at any time; a vehicle may have exactly one active driver assignment. Enforced as a database-level unique constraint: UNIQUE (driver_id) WHERE is_active=1 and UNIQUE (vehicle_id) WHERE is_active=1. |
| --- | --- | --- |
| (4) | BR-291 | **Assignment Persistence:** Execute: INSERT INTO Driver_Vehicle_Assignments (driver_id, vehicle_id, workspace_id, assigned_by, assigned_at, is_active=1). Then: UPDATE Drivers SET status='ASSIGNED'. UPDATE Vehicles SET is_available=0. |
| --- | --- | --- |
| (5) | BR-292 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'ASSIGN_DRIVER_VEHICLE', actor: @UserID, target: @AssignmentID, metadata: { driver_id: @DriverID, vehicle_id: @VehicleID } }. Trigger MSG-136 on success. |
| --- | --- | --- |

#### 

#### UC46: Unassign Driver From Vehicle

##### Use Case Description

| **Name** | **Unassign Driver From Vehicle** |
| --- | --- |
| **Description** | This use case allows a Dispatcher to remove an active driver-vehicle assignment, returning both the driver and vehicle to an available state for new assignment or dispatch. The assignment history is preserved in full for traceability. |
| --- | --- |
| **Actor** | Dispatcher |
| --- | --- |
| **Trigger** | Dispatcher clicks "Unassign" on an active driver-vehicle assignment record. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_DISPATCHER or higher.Target assignment exists, is ACTIVE, and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Assignment is deactivated. Driver status returns to AVAILABLE. Vehicle is_available returns to 1. Assignment history is preserved. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-293 | **Active Assignment Verification:** System verifies: SELECT \* FROM Driver_Vehicle_Assignments WHERE id=@AssignmentID AND is_active=1 AND workspace_id=@WS_ID. If not found or already inactive, display MSG-137 and reject. |
| --- | --- | --- |
| (2) | BR-294 | **On-Trip Guard:** If vehicle current status is ON_TRIP, system blocks the unassignment and displays MSG-138. Unassignment is not permitted until the trip is COMPLETED or the incident is RESOLVED. |
| --- | --- | --- |
| (3)-(4) | BR-295 | **Unassignment Persistence with History:** Execute: UPDATE Driver_Vehicle_Assignments SET is_active=0, unassigned_at=UTC_TIMESTAMP(), unassigned_by=@UserID. Record is never deleted — retained as history. Then: UPDATE Drivers SET status='AVAILABLE'. UPDATE Vehicles SET is_available=1. |
| --- | --- | --- |
| (5) | BR-296 | **Immediate Availability Restoration:** Both driver and vehicle appear in dispatcher's available selection dropdowns within < 1s of unassignment without page reload. |
| --- | --- | --- |
| (6) | BR-297 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'UNASSIGN_DRIVER_VEHICLE', actor: @UserID, target: @AssignmentID, metadata: { driver_id: @DriverID, vehicle_id: @VehicleID } }. Trigger MSG-139 on success. |
| --- | --- | --- |

#### 

#### UC47: Manage Transport Tariff

##### Use Case Description

| **Name** | **Manage Transport Tariff** |
| --- | --- |
| **Description** | This use case allows a Carrier Manager to create and update transport rate cards that define freight pricing based on route, vehicle type, and unit of measure. Rate updates create new versioned entries; existing rates are never overwritten but are marked Expired. Historical orders and quotations retain a reference to the rate version active at their creation time, ensuring pricing immutability for confirmed records. |
| --- | --- |
| **Actor** | Carrier Manager |
| --- | --- |
| **Trigger** | Carrier Manager navigates to the Tariff Management page and creates a new rate card or updates an existing one. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_MANAGER or higher.Workspace is ACTIVE with the Carrier role enabled. |
| --- | --- |
| **Post-condition** | New rate card version is persisted. Previous version is marked EXPIRED. New rates apply to all RFQs created after the update timestamp. Historical records remain linked to their original rate version. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-298 | **Rate Card Mandatory Fields:** Each rate card entry requires: origin_zone, destination_zone, vehicle_type, unit_of_measure (KG/CBM/TRIP), base_rate (positive number), effective_from, and created_by. Optional: surcharge_rules (JSON), notes. If any mandatory field is missing, display MSG-141 and block submission. |
| --- | --- | --- |
| (4) | BR-299 | **Versioned Update — No Overwrite:** When updating a rate card: (a) Mark existing as EXPIRED: UPDATE Tariffs SET status='EXPIRED', expired_at=UTC_TIMESTAMP() WHERE id=@OldTariffID. (b) Insert new: INSERT INTO Tariffs (..., version=@OldVersion+1, status='ACTIVE'). Original rows are never overwritten. |
| --- | --- | --- |
| (5) | BR-300 | **Historical Rate Linkage:** When a freight quotation is confirmed, system stores the tariff_id (version) active at that moment: UPDATE Orders SET confirmed_tariff_id=@TariffID. Subsequent tariff updates do not alter this reference or recalculate any confirmed price. |
| --- | --- | --- |
| (5) | BR-301 | **New Rate Prospective Application:** New rates apply exclusively to RFQs and quotations created_at >= effective_from of the new tariff version. Existing draft or pending RFQs created before effective_from continue to reference the prior active version until re-submitted. |
| --- | --- | --- |
| (3) | BR-302 | **Rate Card Uniqueness per Route+Type:** Only one ACTIVE tariff record may exist per combination of (workspace_id, origin_zone, destination_zone, vehicle_type, unit_of_measure). If an active rate exists for the same combination, the update flow (BR-303) is triggered automatically. If no active tariff found during quotation, display MSG-140 and allow manual price entry only. |
| --- | --- | --- |
| (6) | BR-303 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'UPDATE_TARIFF', actor: @UserID, target: @NewTariffID, metadata: { old_tariff_id: @OldID, route: @Route, new_rate: @Rate } }. Trigger MSG-142 on success. |
| --- | --- | --- |

#### 

#### UC48: Create Initial Freight Quotation

##### Use Case Description

| **Name** | **Create Initial Freight Quotation** |
| --- | --- |
| **Description** | This use case allows a Carrier Sales Staff member to generate an initial freight quotation in response to an RFQ from a Buyer or Supplier. The quotation is auto-calculated based on the applicable rate card, with the option for the Sales Staff to manually adjust the price before sending. The generated quotation is recorded in the audit log and sent to both the Buyer and Supplier within the 2-second performance constraint. |
| --- | --- |
| **Actor** | Carrier Sales Staff |
| --- | --- |
| **Trigger** | Carrier Sales Staff opens an incoming freight RFQ and clicks "Generate Quotation". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_SALES_STAFF or higher.Target freight RFQ exists, is assigned to the user's workspace, and has status PENDING_RESPONSE. |
| --- | --- |
| **Post-condition** | Freight quotation is generated and sent to Buyer and Supplier. Quotation is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-304 | **Rate Card Lookup:** System auto-calculates using: SELECT base_rate FROM Tariffs WHERE workspace_id=@WS_ID AND origin_zone=@Origin AND destination_zone=@Dest AND vehicle_type=@VType AND status='ACTIVE'. If no matching tariff exists, display MSG-140 and allow manual price entry only. |
| --- | --- | --- |
| (4) | BR-305 | **Manual Price Adjustment:** Staff may override the auto-calculated price. Manual price must be a positive number; if invalid, display MSG-143. System records both calculated_price and final_price separately for audit purposes. |
| --- | --- | --- |
| (5) | BR-306 | **Quotation Fields:** Each quotation must include: rfq_id, carrier_workspace_id, vehicle_type, estimated_distance, base_rate, surcharges, final_quoted_price, estimated_delivery_date, terms_and_conditions, and quoted_by. |
| --- | --- | --- |
| (3) | BR-307 | **Performance Constraint**: Complete quotation (rate lookup, calculation, form pre-population) must be displayed to Staff within < 2s of clicking "Generate Quotation." |
| --- | --- | --- |
| (6) | BR-308 | **Quotation Dispatch & RFQ Status Transition:** Upon submission, system sends quotation to both the requesting Buyer and linked Supplier via INF-SVC-01 (in-app notification + email) within < 30s. RFQ status transitions to RESPONDED. |
| --- | --- | --- |
| (7) | BR-309 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'CREATE_FREIGHT_QUOTATION', actor: @UserID, target: @QuotationID, metadata: { rfq_id: @RFQID, final_price: @Price } }. Trigger MSG-144 on success. |
| --- | --- | --- |

#### 

#### UC49: Negotiate Freight Quotation

##### Use Case Description

| **Name** | **Negotiate Freight Quotation** |
| --- | --- |
| **Description** | This use case allows a Carrier Sales Staff member, together with a Buyer and Supplier, to conduct multi-round freight price negotiations. Each submitted round is immutable once sent. All three parties can view the complete negotiation history. Status updates are pushed to all parties within 30 seconds of each round submission. |
| --- | --- |
| **Actor** | Carrier Sales Staff, Buyer Staff, Supplier Staff |
| --- | --- |
| **Trigger** | A participant submits a new negotiation round within the freight quotation negotiation thread. |
| --- | --- |
| **Pre-condition** | User is authenticated as CARRIER_SALES_STAFF (assigned to the RFQ), BUYER_STAFF, or SUPPLIER_STAFF (parties to the underlying order).Freight quotation exists with status NEGOTIATING. |
| --- | --- |
| **Post-condition** | New negotiation round is persisted and immutable. All three parties receive a push notification within < 30 s. Negotiation thread is updated immediately. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-310 | **Rate Card Lookup:** System auto-calculates using: SELECT base_rate FROM Tariffs WHERE workspace_id=@WS_ID AND origin_zone=@Origin AND destination_zone=@Dest AND vehicle_type=@VType AND status='ACTIVE'. If no matching tariff exists, display MSG-140 and allow manual price entry only. |
| --- | --- | --- |
| (5) | BR-311 | **Manual Price Adjustment:** Staff may override the auto-calculated price. Manual price must be a positive number; if invalid, display MSG-143. System records both calculated_price and final_price separately for audit purposes. |
| --- | --- | --- |
| (4) | BR-312 | **Quotation Fields:** Each quotation must include: rfq_id, carrier_workspace_id, vehicle_type, estimated_distance, base_rate, surcharges, final_quoted_price, estimated_delivery_date, terms_and_conditions, and quoted_by. |
| --- | --- | --- |
| (3) | BR-313 | **Performance Constraint:** Complete quotation (rate lookup, calculation, form pre-population) must be displayed to Staff within < 2s of clicking "Generate Quotation." |
| --- | --- | --- |
| (6) | BR-314 | **Quotation Dispatch & RFQ Status Transition:** Upon submission, system sends quotation to both the requesting Buyer and linked Supplier via INF-SVC-01 (in-app notification + email) within < 30s. RFQ status transitions to RESPONDED. |
| --- | --- | --- |

#### 

#### UC50: Finalize & Lock Quotation

##### Use Case Description

| **Name** | **Finalize & Lock Quotation** |
| --- | --- |
| **Description** | This use case allows a Carrier Sales Staff member to finalize and permanently lock a freight quotation after all parties have reached agreement. Once finalized, the agreed freight rate is immutably recorded in the transport order. A shipment order is automatically created. Both Buyer and Supplier are notified of the confirmed rate. |
| --- | --- |
| **Actor** | Carrier Sales Staff |
| --- | --- |
| **Trigger** | Carrier Sales Staff clicks "Finalize Quotation" after all parties have accepted the latest negotiation round. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_SALES_STAFF or higher.Freight quotation status is NEGOTIATING.All parties have accepted the latest negotiation round. |
| --- | --- |
| **Post-condition** | Freight quotation status is updated to CONFIRMED and permanently locked. Agreed freight rate is immutably recorded in the transport order. Shipment order is auto-created. Both parties are notified. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-315 | **All-Party Acceptance Prerequisite:** System verifies all active parties (Buyer, Supplier, Carrier) have accepted the latest negotiation round. If any party has not accepted, \[btnFinalize\] is disabled and the API rejects with HTTP 409 and MSG-148. |
| --- | --- | --- |
| (4) | BR-316 | **Quotation Lock — Permanent Immutability:** Execute: UPDATE FreightQuotations SET status='CONFIRMED', confirmed_by=@UserID, confirmed_at=UTC_TIMESTAMP(), is_locked=1. Once is_locked=1, no field can be modified by any role. Enforced at application and database layers. |
| --- | --- | --- |
| (5) | BR-317 | **Agreed Rate Snapshot:** System records the finalized freight rate in the transport order: INSERT INTO TransportOrders (quotation_id, confirmed_freight_rate, ...) or UPDATE if draft exists. This rate is the sole authoritative value for billing and dispute resolution. |
| --- | --- | --- |
| (6) | BR-318 | **Automatic Shipment Order Creation:** System automatically creates a shipment order with status PENDING_DISPATCH, linking it to the confirmed quotation, purchase order, and carrier workspace. No manual dispatcher action is required. |
| --- | --- | --- |
| (8) | BR-319 | **Notification to All Parties, Audit & Success Feedback:** System publishes EVENT_FREIGHT_QUOTATION_CONFIRMED. INF-SVC-01 delivers notification to Buyer and Supplier with confirmed rate and ETA within < 30s. Record into System_Audit: { action: 'FINALIZE_FREIGHT_QUOTATION', confirmed_rate, shipment_order_id }. Trigger MSG-150 on success. |
| --- | --- | --- |

#### 

#### UC51: Dispatch & Issue Transport Order

##### Use Case Description

| **Name** | **Dispatch & Issue Transport Order** |
| --- | --- |
| **Description** | This use case allows a Dispatcher to assign an available vehicle and driver pair to a shipment order, formally issuing the transport order and initiating delivery. Only valid, active driver-vehicle assignments that are not already on another trip can be selected. After dispatch, both the driver and vehicle statuses change to ON_TRIP. Transport order details are immutable after issuance to prevent fraud. |
| --- | --- |
| **Actor** | Dispatcher |
| --- | --- |
| **Trigger** | Dispatcher opens a shipment order in PENDING_DISPATCH status and assigns a vehicle-driver pair, then confirms dispatch. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_DISPATCHER or higher.Shipment order exists with status PENDING_DISPATCH and belongs to the user's workspace.At least one valid, active driver-vehicle assignment is available. |
| --- | --- |
| **Post-condition** | Transport order is issued. Driver and vehicle statuses change to ON_TRIP. Trip details are sent to the driver app within < 10 s. Transport order details are permanently immutable after issuance. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-320 | **Available Assignment Filter:** Dispatcher's selection list shows only assignments where: Driver.status='AVAILABLE', Vehicle.status='ACTIVE', Vehicle.is_available=1, and the assignment is_active=1 with no current active trip. ON_TRIP, MAINTENANCE, INCIDENT, or INACTIVE assignments are excluded. |
| --- | --- | --- |
| (2) | BR-321 | **Active Trip Conflict Guard:** Before confirming dispatch, system verifies: SELECT COUNT(\*) FROM TransportOrders WHERE (driver_id=@DriverID OR vehicle_id=@VehicleID) AND status='ON_TRIP'. If count > 0, reject dispatch with MSG-151. |
| --- | --- | --- |
| (4) | BR-322 | **Transport Order Issuance:** Execute: UPDATE TransportOrders SET status='ON_TRIP', driver_id=@DriverID, vehicle_id=@VehicleID, dispatched_by=@UserID, dispatched_at=UTC_TIMESTAMP(), is_locked=1. Simultaneously: UPDATE Drivers SET status='ON_TRIP'. UPDATE Vehicles SET status='ON_TRIP', is_available=0. |
| --- | --- | --- |
| (4) | BR-323 | **Post-Issuance Immutability:** Once is_locked=1, the issued_time and assigned driver/vehicle fields cannot be modified by any role. Prevents fraudulent tampering with dispatch records. Enforced at application service layer and database trigger. |
| --- | --- | --- |
| (7) | BR-324 | **Driver App Notification SLA:** System publishes EVENT_TRIP_DISPATCHED. Trip details (route, pickup/delivery address, goods type, customer contact) are pushed to the driver's mobile app within < 10s of dispatch confirmation. |
| --- | --- | --- |
| (7) | BR-325 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'DISPATCH_TRANSPORT_ORDER', actor: @UserID, target: @TransportOrderID, metadata: { driver_id: @DriverID, vehicle_id: @VehicleID } }. Trigger MSG-153 on success. Display MSG-152 for confirmation before execution. |
| --- | --- | --- |

#### 

#### UC52: Issue Freight Invoice

##### Use Case Description

| **Name** | **Issue Freight Invoice** |
| --- | --- |
| **Description** | This use case allows a Carrier Accountant to issue a freight invoice after delivery completion. Invoices are initially created as drafts and can be edited freely. Once finalized by explicit user confirmation, the invoice is permanently immutable. Any correction after finalization must be handled through an Adjustment Invoice that references the original. Invoices are served exclusively via signed URLs; direct URLs are never exposed. |
| --- | --- |
| **Actor** | Carrier Accountant |
| --- | --- |
| **Trigger** | Carrier Accountant opens a completed shipment order and clicks "Issue Invoice". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_ACCOUNTANT or higher.Linked shipment order has status COMPLETED (e-POD submitted).No finalized invoice already exists for this shipment order. |
| --- | --- |
| **Post-condition** | Invoice is created. If finalized, it becomes permanently immutable. Invoice is accessible only via signed URL. Action is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-326 | **Invoice Status Lifecycle:** Invoice statuses: DRAFT → FINALIZED. A FINALIZED invoice requiring correction generates a linked ADJUSTMENT invoice. Allowed status values: DRAFT, FINALIZED, ADJUSTED. No other status values are permitted. |
| --- | --- | --- |
| (2) | BR-327 | **Draft Editability:** While in DRAFT status, all invoice fields (amount, line items, dates, terms) may be edited freely without restriction. |
| --- | --- | --- |
| (4)-(5) | BR-328 | **Finalization Confirmation Requirement:** Before transitioning from DRAFT to FINALIZED, system displays MSG-154 confirmation dialog. Accountant must explicitly confirm. Execute: UPDATE FreightInvoices SET status='FINALIZED', finalized_by=@UserID, finalized_at=UTC_TIMESTAMP(), is_locked=1 WHERE id=@InvoiceID AND status='DRAFT'. Trigger MSG-155 on success. |
| --- | --- | --- |
| (5) | BR-329 | **Post-Finalization Immutability:** Once is_locked=1, no UPDATE or DELETE is permitted on the invoice record by any role. Any correction must be submitted as a new ADJUSTMENT invoice. |
| --- | --- | --- |
| (6) | BR-330 | A**djustment Invoice Linkage & Validation:** Each adjustment invoice must reference the original via references_invoice_id. The correction_reason field is mandatory (min 1 non-whitespace character); if blank, display MSG-156. Original invoice status is updated to ADJUSTED after the adjustment is finalized. Trigger MSG-157 on successful adjustment. |
| --- | --- | --- |
| (7) | BR-331 | **Signed URL Only Access:** Invoices are stored in INF-SVC-02 and accessed exclusively via signed URLs (default TTL=1 hour). Direct storage URLs are never returned to any client. URL generation is logged per request. |
| --- | --- | --- |
| (8) | BR-332 | **Audit Logging:** Record into System_Audit: { action: 'FINALIZE_FREIGHT_INVOICE' \| 'CREATE_ADJUSTMENT_INVOICE', actor: @UserID, target: @InvoiceID, metadata: { shipment_order_id: @ShipmentID } }. |
| --- | --- | --- |

#### 

#### UC53: Report Shipment Incident

##### Use Case Description

| **Name** | **Report Shipment Incident** |
| --- | --- |
| **Description** | This use case allows a Driver to report a vehicle or shipment incident that occurs during an active trip. The incident report must include photo evidence and GPS coordinates. Upon submission, the Carrier Manager is immediately notified, the shipment status is updated, and the vehicle is blocked from further dispatch actions until the incident is resolved. The Carrier Manager then decides whether to continue, delay, or cancel the shipment. |
| --- | --- |
| **Actor** | Driver |
| --- | --- |
| **Trigger** | Driver taps "Report Incident" in the driver mobile app during an active trip. |
| --- | --- |
| **Pre-condition** | Driver is authenticated with role: DRIVER.Driver has an active trip in progress (TransportOrder status = ON_TRIP). |
| --- | --- |
| **Post-condition** | Incident is recorded with photo and GPS. Shipment status transitions to INCIDENT or DELAYED. Vehicle is blocked from dispatch. Carrier Manager is notified immediately. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-333 | **Active Trip Prerequisite:** System verifies: SELECT \* FROM TransportOrders WHERE driver_id=@DriverID AND status='ON_TRIP'. If no active trip found, reject with MSG-158. |
| --- | --- | --- |
| (2) | BR-334 | **Mandatory Evidence Requirements:** Each incident report must include: (a) At least one photo (JPG/PNG, max 10MB), uploaded to INF-SVC-02 before submission. (b) GPS coordinates auto-captured from device (latitude, longitude, accuracy). (c) Incident type (ACCIDENT/BREAKDOWN/DELAY/OTHER). (d) Description min 10 characters. If any missing, display MSG-159 and reject. |
| --- | --- | --- |
| (3) | BR-335 | **Shipment Status Transition:** Execute: UPDATE TransportOrders SET status=CASE WHEN @IncidentType IN ('ACCIDENT','BREAKDOWN') THEN 'INCIDENT' ELSE 'DELAYED' END, incident_reported_at=UTC_TIMESTAMP(). STATUS=INCIDENT or DELAYED blocks all further automated dispatch actions on this order. |
| --- | --- | --- |
| (4) | BR-336 | **Vehicle Dispatch Block:** Execute: UPDATE Vehicles SET status='INCIDENT', is_available=0. Constraint: vehicle removed from dispatch dropdown within < 1s of incident confirmation, without page reload. |
| --- | --- | --- |
| (5) | BR-337 | **Carrier Manager Notification SLA:** System publishes EVENT_INCIDENT_REPORTED. INF-SVC-01 delivers push notification and email to Carrier Manager with incident type, GPS location, and direct link to incident detail page within < 30s. |
| --- | --- | --- |
| (6) | BR-338 | **Manager Resolution Actions:** After reviewing the incident, Carrier Manager may: CONTINUE (resume trip, vehicle status → ON_TRIP), DELAY (reschedule delivery, status → DELAYED), or CANCEL (cancel shipment, status → CANCELLED). Each action recorded with actor, timestamp, and reason. |
| --- | --- | --- |
| (7) | BR-339 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'REPORT_INCIDENT', actor: @DriverID, target: @TransportOrderID, metadata: { incident_type: @Type, gps: { lat, lng } } }. Trigger MSG-160 on success. |
| --- | --- | --- |

#### 

#### UC54: Monitor Real-time Tracking & ETA

##### Use Case Description

| **Name** | **Monitor Real-time Tracking & ETA** |
| --- | --- |
| **Description** | This use case allows authorized parties — Carrier Manager, Dispatcher, or Buyer — to view the real-time location and estimated time of arrival (ETA) of a vehicle on an active trip. ETA is recalculated on every GPS ping. For Buyer-facing views, the driver's phone number is masked to protect personal data. Only users directly involved in the specific shipment can access tracking data. |
| --- | --- |
| **Actor** | Carrier Manager, Carrier Dispatcher, Buyer Staff |
| --- | --- |
| **Trigger** | An authorized user opens the shipment tracking view for an active transport order. |
| --- | --- |
| **Pre-condition** | User is authenticated with a valid session and is an authorized participant of the shipment.Transport order status is ON_TRIP or DELAYED. |
| --- | --- |
| **Post-condition** | Real-time location map and ETA are displayed. GPS updates every 30 s. Phone number masking is applied per role. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-340 | **Shipment Participant Authorization:** System verifies: SELECT \* FROM Shipment_Participants WHERE transport_order_id=@OrderID AND (user_id=@UserID OR workspace_id=@WS_ID). Non-participants receive HTTP 403 and MSG-161. Enforced at API layer. |
| --- | --- | --- |
| (3) | BR-341 | **GPS Update Frequency:** Tracking system receives GPS pings from driver's device every <= 30s. Each ping updates last_known_lat, last_known_lng, last_ping_at. Map reflects latest ping position within 30s of actual vehicle position. |
| --- | --- | --- |
| (4) | BR-342 | **ETA Recalculation per Ping:** On every GPS ping, system recalculates ETA based on: current position, remaining route distance, current speed (from GPS), and traffic conditions. Recalculated ETA is pushed to all active tracking sessions in real time. |
| --- | --- | --- |
| (5) | BR-343 | **Driver Phone Number Masking for Buyers:** When a Buyer user accesses tracking view, driver's phone number is displayed in masked format only (e.g., 09\*\*\*\*\*78 — first 2 and last 2 digits visible). Real phone number is never transmitted to Buyer client in any API response. Carrier Manager and Dispatcher receive full unmasked number. |
| --- | --- | --- |
| (6) | BR-344 | **Tracking Data Scope Isolation:** A Buyer can only view tracking data for shipments linked to their own orders. Carrier Manager/Dispatcher can view all active trips within their workspace. Cross-workspace tracking data is never returned. |
| --- | --- | --- |

#### 

#### UC55: Playback Shipment Route

##### Use Case Description

| **Name** | **Playback Shipment Route** |
| --- | --- |
| **Description** | This use case allows a Carrier Manager or Platform Admin to replay the historical GPS route of a completed or incident-affected shipment for dispute resolution purposes. Playback renders a time-sequenced map of all GPS points recorded during the trip. Route history is retained immutably for a minimum of 5 years. |
| --- | --- |
| **Actor** | Carrier Manager, Platform Admin |
| --- | --- |
| **Trigger** | Carrier Manager or Platform Admin opens a completed shipment's detail page and clicks "Playback Route". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_MANAGER or PLATFORM_ADMIN.Target transport order has status COMPLETED, INCIDENT, or CANCELLED.GPS history records exist for the shipment. |
| --- | --- |
| **Post-condition** | Historical route is rendered on the playback map with GPS points and timestamps. Access is logged. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-345 | **Access Restriction:** Only CARRIER_MANAGER (within the carrier's workspace) and PLATFORM_ADMIN roles may access the route playback feature. All other roles — including Buyers and Suppliers — receive HTTP 403 and MSG-162. Enforcement is at the API layer. |
| --- | --- | --- |
| (2) | BR-346 | **GPS History Data Retrieval:** System queries: SELECT latitude, longitude, speed, timestamp FROM Vehicle_GPS_History WHERE vehicle_id=@VehicleID AND timestamp BETWEEN @TripStart AND @TripEnd ORDER BY timestamp ASC. All points returned in chronological order for accurate playback rendering. If no records found, display MSG-163. |
| --- | --- | --- |
| (4) | BR-347 | **Playback Rendering:** The route playback renders GPS points as a polyline on a map. Each point includes a timestamp tooltip. Users can control playback speed (1x, 2x, 5x). Playback clearly marks start point, end point, and any incident-flagged GPS coordinates. |
| --- | --- | --- |
| (5) | BR-348 | **Immutable Route History Retention:** All Vehicle_GPS_History records have a mandatory minimum retention of >= 5 years. No DELETE operations permitted. After 5 years, records archived to cold storage but must remain queryable for dispute resolution within < 10s of request. |
| --- | --- | --- |
| (6) | BR-349 | **Access Audit Logging:** Every access to route playback is logged regardless of whether data is found: Record into System_Audit: { action: 'PLAYBACK_ROUTE', actor: @UserID, target: @TransportOrderID, metadata: { ip: @IP, timestamp: @TS } }. |
| --- | --- | --- |

#### 

#### UC56: Collect & Submit e-POD

##### Use Case Description

| **Name** | **Collect & Submit e-POD** |
| --- | --- |
| **Description** | This use case allows a Driver to complete the 4-step electronic Proof of Delivery (e-POD) flow to formally confirm delivery: (1) Geofence check-in, (2) Photo capture, (3) Signature capture, (4) Submission. Each step must be completed in sequence. Photo and signature are mandatory. Upon submission, the shipment order is permanently locked. e-POD files are served only via time-limited signed URLs. Platform Admin access to e-POD content requires explicit break-glass authorization. |
| --- | --- |
| **Actor** | Driver |
| --- | --- |
| **Trigger** | Driver taps "Complete Delivery" in the driver mobile app when physically at the delivery location. |
| --- | --- |
| **Pre-condition** | Driver is authenticated with role: DRIVER.Driver has an active trip (TransportOrder status = ON_TRIP or DELAYED).Driver is within 500 m of the recorded delivery GPS coordinates. |
| --- | --- |
| **Post-condition** | e-POD record is created with photo, signature, GPS coordinates, timestamp, and driver identity. Shipment order status is set to COMPLETED and permanently locked. e-POD files are accessible only via signed URLs expiring in 1 hour. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-350 | **Geofence Check-In Enforcement:** \[btnCheckIn\] is active only when driver's GPS is within 500m of delivery address coordinates. If outside range, button is disabled and MSG-164 is shown. Geofence radius is configurable per workspace. |
| --- | --- | --- |
| (1) | BR-351 | **Sequential Step Lock:** e-POD enforces strict 4-step sequence: Step 1 (Geofence Check-In) → Step 2 (Photo Capture) → Step 3 (Signature Capture) → Step 4 (Submit). Each step is locked until previous step is successfully completed. Steps cannot be skipped or reordered. |
| --- | --- | --- |
| (5) | BR-352 | **Mandatory Photo and Signature:** Both photo (Step 2) and recipient signature (Step 3) are mandatory. \[btnSubmit\] is not enabled unless both are captured and uploaded to INF-SVC-02 successfully. If either missing, display MSG-165. Photo: JPG or PNG, max 10MB. |
| --- | --- | --- |
| (6) | BR-353 | **Shipment Order Lock on Submission:** Execute: UPDATE TransportOrders SET status='COMPLETED', completed_at=UTC_TIMESTAMP(), is_locked=1, epod_id=@EPODID. Once is_locked=1, no field can be modified by any role. Enforced at application and database layers. |
| --- | --- | --- |
| (7) | BR-354 | **Signed URL Access Control:** All e-POD files stored in INF-SVC-02 and accessible only via signed URLs with TTL=1 hour. Direct storage URLs are never returned. e-POD accessible only to Carrier (workspace), Supplier, and Buyer of the linked order. Platform Admin cannot access by default — break-glass authorization required from a second Platform Admin; access event is immutably logged. |
| --- | --- | --- |
| (8) | BR-355 | **Offline Resilience:** If device loses network connectivity, data (photo, signature, GPS, timestamp) is stored locally. Upon network restoration, stored e-POD data automatically syncs to server within < 5s without data loss. Server-side submitted_at reflects actual sync time; device_captured_at preserves original offline capture time. |
| --- | --- | --- |
| (9) | BR-356 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'SUBMIT_EPOD', actor: @DriverID, target: @EPODID, metadata: { transport_order_id: @OrderID } }. Trigger MSG-166 on success. |
| --- | --- | --- |

#### 

#### UC57: Submit Trip Expenses

##### Use Case Description

| **Name** | **Submit Trip Expenses** |
| --- | --- |
| **Description** | This use case allows a Driver to submit trip-related expenses (e.g., toll, fuel, parking) with mandatory receipt evidence after completing or during an active trip. Multiple expenses can be submitted per trip. Each submission triggers an approval workflow directed to the Carrier Manager. |
| --- | --- |
| **Actor** | Driver |
| --- | --- |
| **Trigger** | Driver taps "Submit Expense" in the driver mobile app and completes the expense submission form. |
| --- | --- |
| **Pre-condition** | Driver is authenticated with role: DRIVER.Target trip exists and is linked to the driver (status ON_TRIP or COMPLETED). |
| --- | --- |
| **Post-condition** | Expense records are persisted and linked to the trip. Approval workflow is triggered. Manager receives notification. |
| --- | --- |

##### Activities FLow

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-357 | **Trip Linkage Requirement:** System verifies: SELECT id FROM TransportOrders WHERE id=@TripID AND driver_id=@DriverID. If trip does not belong to the requesting driver, reject with HTTP 403. |
| --- | --- | --- |
| (2) | BR-358 | **Mandatory Expense Fields:** Each expense requires: trip_id, expense_type (TOLL/FUEL/PARKING/MEAL/OTHER), amount (positive number), currency, expense_date, and receipt_evidence (at least one uploaded file). Description is optional. Action: If any mandatory field missing, display MSG-167 and block submission. |
| --- | --- | --- |
| (3) | BR-359 | **Receipt Evidence Upload:** Evidence must be uploaded to INF-SVC-02 before expense submission. Supported formats: JPG, PNG, PDF. Maximum file size: 10MB per file. If upload fails, expense submission is blocked. |
| --- | --- | --- |
| (5) | BR-360 | **Multiple Expenses Per Trip:** A driver may submit any number of expense entries for a single trip. Each entry is stored as an independent record linked by trip_id. There is no per-trip expense count limit. |
| --- | --- | --- |
| (6) | BR-361 | **Approval Workflow Trigger & Notification:** System publishes EVENT_EXPENSE_SUBMITTED. INF-SVC-01 notifies the Carrier Manager with expense summary and direct link to approval queue within < 30s. Expense status set to PENDING_APPROVAL. |
| --- | --- | --- |
| (7) | BR-362 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'SUBMIT_TRIP_EXPENSE', actor: @DriverID, target: @ExpenseID, metadata: { trip_id: @TripID, amount: @Amount, type: @Type } }. Trigger MSG-168 on success. |
| --- | --- | --- |

#### 

#### UC58: Approve Trip Expenses

##### Use Case Description

| **Name** | **Approve Trip Expenses** |
| --- | --- |
| **Description** | This use case allows a Carrier Manager to review, approve, or reject driver trip expense submissions. The manager may provide a comment with their decision. The driver is notified of the outcome within 30 seconds. All decisions are recorded in the audit log. |
| --- | --- |
| **Actor** | Carrier Manager |
| --- | --- |
| **Trigger** | Carrier Manager opens the expense approval queue and acts on a pending expense item. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_MANAGER or higher.Target expense exists with status PENDING_APPROVAL and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Expense status transitions to APPROVED or REJECTED. Driver is notified within < 30 s. Decision is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-363 | **Status Pre-Check:** System verifies the target expense has status PENDING_APPROVAL: SELECT status FROM TripExpenses WHERE id=@ExpenseID AND workspace_id=@WS_ID. If not PENDING_APPROVAL, the approve/reject action is rejected. |
| --- | --- | --- |
| (3a) | BR-364 | **Approval Action:** Execute: UPDATE TripExpenses SET status='APPROVED', reviewed_by=@UserID, reviewed_at=UTC_TIMESTAMP(), reviewer_comment=@Comment WHERE id=@ExpenseID AND status='PENDING_APPROVAL'. Reviewer comment is optional for approval. |
| --- | --- | --- |
| (3b) | BR-365 | **Rejection Action:** Execute: UPDATE TripExpenses SET status='REJECTED', reviewed_by=@UserID, reviewed_at=UTC_TIMESTAMP(), reviewer_comment=@Comment WHERE id=@ExpenseID AND status='PENDING_APPROVAL'. Comment is mandatory for rejection (min 1 non-whitespace character); if empty, display MSG-169. |
| --- | --- | --- |
| (4) | BR-366 | **Driver Notification SLA:** System publishes EVENT_EXPENSE_REVIEWED. INF-SVC-01 dispatches push notification and email to driver with decision (APPROVED/REJECTED) and reviewer comment within < 30s. |
| --- | --- | --- |
| (5) | BR-367 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'REVIEW_TRIP_EXPENSE', actor: @UserID, target: @ExpenseID, metadata: { decision: @Decision, driver_id: @DriverID } }. Trigger MSG-170 on success. |
| --- | --- | --- |

#### 

#### UC59: View Executive Dashboard

##### Use Case Description

| **Name** | **View Executive Dashboard** |
| --- | --- |
| **Description** | This use case allows a Carrier Manager to access an executive performance dashboard displaying key operational and financial metrics — including revenue, on-time delivery rate, and fleet utilization — to support data-driven business decisions. Dashboard data is automatically refreshed every 5 minutes. |
| --- | --- |
| **Actor** | Carrier Manager |
| --- | --- |
| **Trigger** | Carrier Manager navigates to the Executive Dashboard page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_MANAGER or higher.Workspace is ACTIVE with the Carrier role enabled. |
| --- | --- |
| **Post-condition** | Dashboard is rendered with current key metrics. Data reflects the state of the platform as of the last refresh cycle (within 5 minutes). |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-368 | **Workspace-Scoped Metrics:** All dashboard metrics are strictly scoped to the requesting user's workspace. Cross-workspace data is never included. Queries always include AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (3) | BR-369 | **Key Metrics Set:** Dashboard must display at minimum: (a) Revenue: total confirmed freight invoice amounts within the selected period. (b) On-Time Delivery Rate: % of COMPLETED orders where actual_delivery_at <= estimated_delivery_date. (c) Fleet Utilization: % of vehicles with status=ON_TRIP relative to total ACTIVE vehicles. |
| --- | --- | --- |
| (4) | BR-370 | **Automatic Data Refresh:** Dashboard data is pre-computed and cached. Cache is invalidated and refreshed every 5 minutes via background job. Users see a timestamp (MSG-171) indicating last refresh time. Manual refresh via "Refresh" button triggers immediate cache recomputation. |
| --- | --- | --- |
| (5) | BR-371 | **Period Filtering:** Users can filter metrics by: Today, Last 7 Days, Last 30 Days, Last Quarter, or Custom Date Range. Changing the filter re-queries the data store and re-renders affected metric cards. |
| --- | --- | --- |
| (1) | BR-372 | **Access Control:** Only CARRIER_MANAGER and higher roles can access the executive dashboard. CARRIER_STAFF, DRIVER, and DISPATCHER roles are denied at the API layer. |
| --- | --- | --- |

#### 

#### UC60: Export Revenue Reports

##### Use Case Description

| **Name** | **Export Revenue Reports** |
| --- | --- |
| **Description** | This use case allows a Carrier Accountant to export revenue reports within a specified date range for financial reconciliation. Reports can be exported in XLSX or PDF format, in either detailed or summary format. Export must complete within 10 seconds. Selected filters are reflected in the report metadata. |
| --- | --- |
| **Actor** | Carrier Accountant |
| --- | --- |
| **Trigger** | Carrier Accountant navigates to the Reports page, applies filters, and clicks "Export". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: CARRIER_ACCOUNTANT or higher.Workspace is ACTIVE with the Carrier role enabled. |
| --- | --- |
| **Post-condition** | Report file is generated and available for download. Export is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-373 | **Mandatory Filter — Date Range:** Users must specify start_date and end_date before export. Date range cannot exceed 366 days in a single export. If date range is empty or exceeds the limit, display MSG-172 and block export. |
| --- | --- | --- |
| (3) | BR-374 | **Export Format Options:** System supports two output formats: XLSX (Excel) and PDF. User selects format before triggering export. Both formats are generated from the same underlying data query. |
| --- | --- | --- |
| (4) | BR-375 | **Report Type Options:** Detailed: one row per order — order_id, date, carrier_workspace, route, freight_amount, invoice_status. Summary: aggregates revenue by date range with total amounts only. User selects type before export. |
| --- | --- | --- |
| (5) | BR-376 | **Optional Filters & Metadata:** Users may additionally filter by order_status and vehicle_type. All applied filters must be reflected in the report header metadata (e.g., "Date Range: 01/01/2025 – 31/03/2025 \| Status: COMPLETED"). |
| --- | --- | --- |
| (6) | BR-377 | **Performance Constraint:** Export file generation must complete within < 10s. For large datasets, system uses background job processing with a progress indicator. Download link is delivered via notification upon completion. |
| --- | --- | --- |
| (7) | BR-378 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'EXPORT_REVENUE_REPORT', actor: @UserID, metadata: { format: @Format, report_type: @Type, date_range: \[@Start, @End\] } }. Trigger MSG-173 on successful file generation. |
| --- | --- | --- |

#### 

### Buyer

#### UC61: Search And Filter Products

##### Use Case Description

| **Name** | **Search And Filter Products** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to search, filter, and sort products across selected supplier catalogs. Only products visible to the Buyer's workspace are returned. Search results display supplier reputation scores per product card. The system remembers the last selected catalogs during the session. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff enters a keyword or applies filters on the Product Search page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Workspace is ACTIVE with Buyer role enabled. |
| --- | --- |
| **Post-condition** | Matching products are displayed ranked by relevance. Results reflect only products visible to the Buyer's workspace. |
| --- | --- |

##### Activities FLow

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-379 | **Workspace Visibility Scope:** Only products with is_visible=1 AND belonging to Supplier workspaces with an active partnership (Workspace_Partnerships.status='ACTIVE') with the Buyer's workspace are returned. Products from non-partnered suppliers are never included. |
| --- | --- | --- |
| (2) | BR-380 | **Multi-Catalog Selection:** Buyer may select one or more supplier catalogs. If none selected, system searches across all catalogs visible to the Buyer. Query: WHERE supplier_workspace_id IN (@SelectedCatalogIDs). If no results after all filters, display MSG-174. |
| --- | --- | --- |
| (3) | BR-381 | **Keyword Search Scope:** Keyword performs case-insensitive match against product name, SKU, and supplier name: WHERE (p.name ILIKE '%@Keyword%' OR p.sku ILIKE '%@Keyword%' OR s.name ILIKE '%@Keyword%'). If no keyword is provided, all products matching active filters are returned. |
| --- | --- | --- |
| (2) | BR-382 | **Filter Parameters:** System supports: category_id, price_range (min/max reference_price), supplier_workspace_id. All filters are applied as AND conditions. |
| --- | --- | --- |
| (4) | BR-383 | **Sort Options:** relevance (default, keyword match score), reference_price ASC/DESC, supplier_reputation_score DESC. Each product card displays the supplier's current reputation score. |
| --- | --- | --- |
| (6) | BR-384 | **Session Catalog Memory:** The last set of selected catalog(s) is retained in the user's session and pre-populated on subsequent page loads within the same session. Session state is cleared on logout. |
| --- | --- | --- |
| (3) | BR-385 | **Performance Constraint:** Results must return within < 2s. Required indexes: (workspace_id, is_visible, name), (workspace_id, is_visible, sku). |
| --- | --- | --- |

##### 

#### UC62: Add Item To RFQ List

##### Use Case Description

| **Name** | **Add Item To RFQ List** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to add catalog products to a draft RFQ list. The draft can be saved and resumed at any time. Each item can be configured with quantity, specifications, and delivery requirements. Duplicate items are automatically merged into a single line. The RFQ remains in Draft status until explicitly submitted. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff clicks "Add to RFQ" on a product card in the search results. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.A draft RFQ exists for the current session, or a new one is auto-created. |
| --- | --- |
| **Post-condition** | Product is added to the draft RFQ. Draft is persisted and resumable. RFQ remains in DRAFT status. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-386 | **Auto-Create Draft RFQ:** If no active draft RFQ exists for the Buyer's workspace, system creates one: INSERT INTO RFQs (workspace_id, status='DRAFT', created_by=@UserID, created_at=UTC_TIMESTAMP()). Only one draft RFQ may exist per workspace at a time. |
| --- | --- | --- |
| (2) | BR-387 | **Duplicate Item Merge:** If the same product (product_id) from the same supplier is added more than once, system merges into a single RFQ line: UPDATE RFQ_Items SET quantity=quantity+@AddedQty WHERE rfq_id=@RFQID AND product_id=@ProductID. No duplicate line items are created. Trigger MSG-175. |
| --- | --- | --- |
| (3) | BR-388 | **Item Configuration Fields:** Each RFQ line item includes: quantity (required, positive integer), specifications_notes (optional free text), required_delivery_date (optional), delivery_location (optional). Users can edit these fields after adding. On successful new item add, trigger MSG-176. |
| --- | --- | --- |
| (4) | BR-389 | **Draft Persistence:** Draft RFQ and all line items are persisted to the database on each add/edit action. The draft is retrievable across sessions until submitted or explicitly deleted. |
| --- | --- | --- |
| (5) | BR-390 | **DRAFT Status Lock:** The RFQ status remains DRAFT until Buyer explicitly clicks "Submit RFQ" (UC63). No automatic status transition occurs while in draft. |
| --- | --- | --- |

##### 

#### UC63: Submit Request For Quotation (RFQ)

##### Use Case Description

| **Name** | **Submit Request For Quotation (RFQ)** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to submit a draft RFQ to one or multiple suppliers. The system automatically groups RFQ items by supplier and creates a separate RFQ per supplier. Each supplier receives only their own items. Upon submission, RFQ content becomes immutable and each supplier's RFQ status changes to PENDING_RESPONSE. The Buyer receives a submission confirmation. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff clicks "Submit RFQ" on a completed draft RFQ. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Draft RFQ exists with at least one line item.All mandatory item fields are completed. |
| --- | --- |
| **Post-condition** | Separate RFQs are created per supplier, each in PENDING_RESPONSE status. RFQ content is immutable. Buyer receives confirmation. Submission is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-391 | **Empty RFQ Prevention:** System validates the draft RFQ has at least one line item. If empty, \[btnSubmit\] is disabled and MSG-177 is displayed. |
| --- | --- | --- |
| (3) | BR-392 | **Mandatory Item Field Validation:** All line items must have at minimum: product_id, supplier_workspace_id, and quantity (positive integer). If any item is missing mandatory fields, display MSG-178 and block submission. |
| --- | --- | --- |
| (4) | BR-393 | **Supplier Grouping:** System groups all RFQ items by supplier_workspace_id. For each unique supplier, creates a separate child RFQ: INSERT INTO RFQs (parent_rfq_id=@DraftRFQID, supplier_workspace_id=@SupWS, status='PENDING_RESPONSE', submitted_at=UTC_TIMESTAMP()). Each child RFQ contains only that supplier's items. |
| --- | --- | --- |
| (4) | BR-394 | **Supplier Isolation:** Each supplier can only query and view RFQs assigned to their workspace: WHERE supplier_workspace_id=@WS_ID. Cross-supplier RFQ data is never exposed. |
| --- | --- | --- |
| (5) | BR-395 | **RFQ Content Immutability on Submission:** System sets is_locked=1 on the parent RFQ and all child RFQs. No line item can be added, removed, or modified after submission by any role. |
| --- | --- | --- |
| (7) | BR-396 | **RFQ Status Lifecycle & Closure:** Valid statuses: DRAFT → PENDING_RESPONSE → RESPONDED → CLOSED / CANCELLED. When Buyer selects a quotation (UC64), parent RFQ status → CLOSED; all other child RFQs → CANCELLED. Direct state-skip transitions are rejected. |
| --- | --- | --- |
| (6) | BR-397 | **Buyer Submission Confirmation & Supplier Notification:** System notifies each supplier (push+email) with their assigned items only. System sends Buyer confirmation MSG-179 with count of suppliers notified and item list. |
| --- | --- | --- |
| (8) | BR-398 | **Audit Logging:** Record into System_Audit: { action: 'SUBMIT_RFQ', actor: @UserID, target: @ParentRFQID, metadata: { supplier_count: @Count, item_count: @ItemCount } }. |
| --- | --- | --- |

##### 

#### UC64: Compare & Select Supplier Quotation

##### Use Case Description

| **Name** | **Compare & Select Supplier Quotation** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to compare all received quotations for a submitted RFQ side-by-side and select the best offer. The selected quotation becomes the basis for purchase order creation. Non-selected quotations are marked Rejected. The selected quotation is locked immediately for downstream order creation. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff opens the RFQ detail page after one or more suppliers have responded and clicks "Compare Quotations". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Parent RFQ exists with status RESPONDED (at least one supplier has submitted a quotation). |
| --- | --- |
| **Post-condition** | Selected quotation is locked. Purchase order creation is initiated. Non-selected quotations are marked REJECTED. Selection is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-399 | **Comparison Data Display:** System presents all received supplier quotations side-by-side. Each column represents one supplier and displays: unit_price, total_price, delivery_terms, estimated_delivery_date, supplier_reputation_score. Columns are sortable by any field. |
| --- | --- | --- |
| (3) | BR-400 | **Selection Action & Validation:** Buyer selects exactly one supplier per parent RFQ. System validates only one selection is made. If zero or more than one selection is attempted, display MSG-180 and block confirmation. |
| --- | --- | --- |
| (5) | BR-401 | **Selected Quotation Lock:** Execute: UPDATE Quotations SET status='SELECTED', is_locked=1 WHERE id=@SelectedQuotID. The locked quotation is the authoritative basis for downstream purchase order creation. No further modifications are permitted. |
| --- | --- | --- |
| (6) | BR-402 | **Non-Selected Quotation Rejection:** All other quotations for the same RFQ are automatically updated: UPDATE Quotations SET status='REJECTED' WHERE rfq_id=@RFQID AND id!=@SelectedQuotID. Rejected suppliers are notified via INF-SVC-01. |
| --- | --- | --- |
| (7) | BR-403 | **RFQ Closure:** Upon selection, execute: UPDATE RFQs SET status='CLOSED', closed_at=UTC_TIMESTAMP() WHERE id=@ParentRFQID. All child RFQs from non-selected suppliers: UPDATE RFQs SET status='CANCELLED'. |
| --- | --- | --- |
| (4) | BR-404 | **Selection Confirmation Dialog:** System displays MSG-181 confirmation before executing selection. Buyer must explicitly confirm before any status transitions are applied. |
| --- | --- | --- |
| (8) | BR-405 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'SELECT_SUPPLIER_QUOTATION', actor: @UserID, target: @SelectedQuotID, metadata: { rfq_id: @RFQID, rejected_quotations: \[@RejectedIDs\] } }. Trigger MSG-182 on success. |
| --- | --- | --- |

##### 

#### UC65: Assign Order Task (Buyer)

##### Use Case Description

| **Name** | **Assign Order Task (Buyer)** |
| --- | --- |
| **Description** | This use case allows a Buyer Manager to assign ownership of a purchase order to a specific active Buyer Staff member within the same workspace. The assignment establishes clear accountability for order tracking and follow-up. The assigned staff member is notified immediately. |
| --- | --- |
| **Actor** | Buyer Manager |
| --- | --- |
| **Trigger** | Buyer Manager opens an order detail page and selects a staff member from the "Assign To" dropdown. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_MANAGER or higher.Target order belongs to the user's workspace.Target assignee is an active employee within the same workspace. |
| --- | --- |
| **Post-condition** | Order is linked to the assigned staff member. Assignment is visible in the order detail page. Assignee receives notification within < 30 s. Assignment is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-406 | **Manager Role Enforcement:** Only users with role BUYER_MANAGER or higher may assign order tasks. Enforced at API layer. The "Assign To" control is not rendered for non-manager roles. |
| --- | --- | --- |
| (3) | BR-407 | **Assignee Eligibility Check:** System verifies: SELECT id FROM Users WHERE id=@AssigneeID AND workspace_id=@WS_ID AND is_active=1 AND role IN ('BUYER_STAFF','BUYER_MANAGER'). If not found, display MSG-183 and reject. Inactive accounts are excluded from the dropdown. |
| --- | --- | --- |
| (4) | BR-408 | **Assignment Persistence:** Execute: UPDATE Orders SET assigned_to=@AssigneeID, assigned_by=@ManagerID, assigned_at=UTC_TIMESTAMP() WHERE id=@OrderID AND workspace_id=@WS_ID. A single order can only have one active assignee. Re-assignment overwrites previous value. |
| --- | --- | --- |
| (5) | BR-409 | **Assignee Notification SLA:** System publishes EVENT_ORDER_ASSIGNED. INF-SVC-01 delivers push notification and email to assignee with order summary and direct link within < 30s. |
| --- | --- | --- |
| (6) | BR-410 | **Assignment Visibility & Success Feedback:** Assigned staff name is displayed on the order list and detail page. Assignee sees the order in their "My Tasks" view. Trigger MSG-184 on success. |
| --- | --- | --- |
| (7) | BR-411 | **Audit Logging:** Record into System_Audit: { action: 'ASSIGN_ORDER_BUYER', actor: @ManagerID, target: @OrderID, metadata: { assigned_to: @AssigneeID } }. |
| --- | --- | --- |

##### 

#### UC66: Reassign Order Task (Buyer)

##### Use Case Description

| **Name** | **Reassign Order Task (Buyer)** |
| --- | --- |
| **Description** | This use case allows a Buyer Manager to reassign an existing order task from the current Buyer Staff assignee to another active staff member within the same workspace. Previous assignment history is preserved in an append-only log. The new assignee gains immediate access to the full order history. |
| --- | --- |
| **Actor** | Buyer Manager |
| --- | --- |
| **Trigger** | Buyer Manager opens an order detail page with an existing assignment and selects a different staff member from the "Reassign To" dropdown. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_MANAGER or higher.Target order belongs to the workspace and has an existing active assignee.New assignee is an active employee in the same workspace, different from the current assignee. |
| --- | --- |
| **Post-condition** | Order is reassigned. Previous assignment is archived in history. Both old and new assignees receive notifications. Reassignment is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-412 | **Manager Role Enforcement:** Only BUYER_MANAGER or higher may perform reassignment. Enforced at API layer. HTTP 403 for insufficient roles. |
| --- | --- | --- |
| (2) | BR-413 | **Existing Assignment Prerequisite:** System verifies: SELECT assigned_to FROM Orders WHERE id=@OrderID AND workspace_id=@WS_ID AND assigned_to IS NOT NULL. If no current assignee exists, system redirects to Assign Order Task flow (UC65). |
| --- | --- | --- |
| (3) | BR-414 | **New Assignee Eligibility Check:** New assignee must be active, in the same workspace, with role BUYER_STAFF or BUYER_MANAGER. Inactive accounts are excluded from the dropdown. |
| --- | --- | --- |
| (3) | BR-415 | **Same-Person Guard:** IF @NewAssigneeID = @CurrentAssigneeID THEN REJECT with inline MSG-185. Prevents no-op reassignments from polluting assignment history. |
| --- | --- | --- |
| (4)-(5) | BR-416 | **Assignment History Preservation:** Before update, insert history: INSERT INTO Order_Assignment_History (order_id, assigned_to, assigned_by, assigned_at, unassigned_at, unassigned_by). Then: UPDATE Orders SET assigned_to=@NewAssigneeID, assigned_by=@ManagerID, assigned_at=UTC_TIMESTAMP(). |
| --- | --- | --- |
| (6) | BR-417 | **Dual Notification SLA:** New assignee receives push+email with order details. Previous assignee receives push+email that task has been transferred. Both delivered within < 30s. |
| --- | --- | --- |
| (7) | BR-418 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'REASSIGN_ORDER_BUYER', actor: @ManagerID, target: @OrderID, metadata: { previous_assignee: @PrevID, new_assignee: @NewID } }. Trigger MSG-186 on success. |
| --- | --- | --- |

#### 

#### UC67: View My Assigned Tasks (Buyer)

##### Use Case Description

| **Name** | **View My Assigned Tasks (Buyer)** |
| --- | --- |
| **Description** | This use case allows Buyer Staff to view only purchase orders assigned to them, enabling focused work management. Buyer Managers and higher roles can view all orders within their workspace scope. Access control is enforced at the API layer. |
| --- | --- |
| **Actor** | Buyer Staff, Buyer Manager |
| --- | --- |
| **Trigger** | User navigates to the "My Tasks" section from the main navigation. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Workspace is ACTIVE with Buyer role enabled. |
| --- | --- |
| **Post-condition** | Filtered task list is displayed scoped per role. Access control is enforced at API layer. |
| --- | --- |

##### Activities FLow

##### 

##### 

##### Sequence FLow

##### 

##### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-419 | **Role-Based Scope Enforcement:** BUYER_STAFF: query strictly filtered by assigned_to=@CurrentUserID. BUYER_MANAGER+: all orders WHERE workspace_id=@WS_ID without the assignee filter. Scoping is enforced at the API layer and cannot be bypassed via query parameters. |
| --- | --- | --- |
| (3) | BR-420 | **Default Sort Order:** Composite sort — status priority (PENDING > NEGOTIATING > APPROVED > others), then created_at ASC. User can manually override sort to: created_at DESC, total_value DESC, or status ASC. |
| --- | --- | --- |
| (4) | BR-421 | **Visible Statuses:** Non-terminal statuses shown by default: PENDING, NEGOTIATING, APPROVED, PENDING_CREDIT_APPROVAL. Terminal statuses (DENIED, CONFIRMED, DELIVERED) excluded unless "Show Completed" toggle is active. |
| --- | --- | --- |
| (5) | BR-422 | **Task Card Data Requirements:** Each row must display: order_id, supplier_name, total_value, status (color-coded badge), assigned_at, and direct link to order detail. Missing or null fields display as "—". |
| --- | --- | --- |
| (2) | BR-423 | **Cross-Staff Isolation:** BUYER_STAFF cannot see orders assigned to other staff members. WHERE assigned_to=@CurrentUserID is enforced at the DB query level, not only UI layer. If no results match, display MSG-187. |
| --- | --- | --- |
| (7) | BR-424 | **Performance Constraint:** List must load within < 2s. Required indexes: (workspace_id, assigned_to, status), (workspace_id, status, created_at). |
| --- | --- | --- |

##### 

#### UC68: Monitor Order Status

##### Use Case Description

| **Name** | **Monitor Order Status** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to monitor the current status of all purchase orders belonging to their workspace in a unified list view. Orders are filterable by status, date, and supplier. Full status history is visible per order. Status change notifications are pushed within 30 seconds. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | User navigates to the Order Tracking page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Workspace is ACTIVE. |
| --- | --- |
| **Post-condition** | Order list is displayed with current status. Only workspace orders are visible. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-425 | **Workspace Isolation:** All queries scoped to: WHERE workspace_id=@WS_ID. Orders from other workspaces are never returned. If no orders match filters, display MSG-188. |
| --- | --- | --- |
| (2) | BR-426 | **Filter Parameters:** System supports: status (multi-select), date_range (created_at BETWEEN @Start AND @End), supplier_workspace_id. All filters are AND conditions. |
| --- | --- | --- |
| (3) | BR-427 | **Order Status History:** Each order detail page includes a chronological, append-only status history log showing: status_value, changed_at, changed_by (actor). The log cannot be edited by any role. |
| --- | --- | --- |
| (4) | BR-428 | **Real-Time Status Push:** When any order status changes, system publishes EVENT_ORDER_STATUS_CHANGED. INF-SVC-01 delivers in-app notification to the order's assignee and Buyer Manager within < 30s. |
| --- | --- | --- |
| (6) | BR-429 | **Performance Constraint:** Order list must load within < 2s with standard filters applied. |
| --- | --- | --- |

#### UC69: Export Order History

##### Use Case Description

| **Name** | **Export Order History** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to export their workspace's order history for internal reporting. Export is available in XLSX and PDF formats with a mandatory date range filter. Export must complete within 10 seconds. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff navigates to the Order History Export page, applies a date range filter, and clicks "Export". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher. |
| --- | --- |
| **Post-condition** | Export file is generated and available for download within < 10 s. Export is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-430 | **Mandatory Date Range:** Users must provide start_date and end_date. Date range cannot exceed 366 days. If missing or oversized, display MSG-189 and block export. |
| --- | --- | --- |
| (3) | BR-431 | **Export Format:** Supports XLSX and PDF. Each exported row includes: order_id, supplier_name, status, total_value, created_at, confirmed_at (if applicable). Both formats generated from the same underlying data query. |
| --- | --- | --- |
| (4) | BR-432 | **Workspace Scoping:** Export strictly includes orders WHERE workspace_id=@WS_ID. No cross-workspace data is included. |
| --- | --- | --- |
| (5) | BR-433 | **Performance Constraint:** Export must complete within < 10s. For large date ranges, system processes as a background job with progress indicator. Download link is delivered via notification upon completion. Trigger MSG-190 on success. |
| --- | --- | --- |
| (6) | BR-434 | **Audit Logging:** Record into System_Audit: { action: 'EXPORT_ORDER_HISTORY', actor: @UserID, metadata: { date_range: \[@Start, @End\], format: @Format } }. |
| --- | --- | --- |

#### UC70: View Freight Quotation Options

##### Use Case Description

| **Name** | **View Freight Quotation Options** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to view and compare freight quotation options from carriers associated with their order. Quotations display carrier details, rate, estimated delivery time, and reputation score. Only quotations linked to the Buyer's own RFQ are accessible. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff opens the logistics tab of an order detail page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Order has associated freight RFQ with at least one carrier quotation. |
| --- | --- |
| **Post-condition** | Freight quotation list is displayed scoped to the Buyer's RFQ. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-435 | **RFQ-Scoped Visibility & Access Control:** System returns only quotations WHERE freight_rfq_id IN (SELECT id FROM FreightRFQs WHERE buyer_workspace_id=@WS_ID). Only BUYER_STAFF and higher with workspace linkage to the order can access. HTTP 403 + MSG-192 for unauthorized access. |
| --- | --- | --- |
| (3) | BR-436 | **Quotation Display Fields:** Each quotation card displays: carrier_name, carrier_reputation_score, quoted_freight_rate, estimated_delivery_date, vehicle_type, terms_summary. |
| --- | --- | --- |
| (4) | BR-437 | **Side-by-Side Comparison & Sort:** System renders all available carrier quotations in a comparison table. Users can sort by: freight_rate ASC, estimated_delivery_date ASC, or carrier_reputation_score DESC. If no quotations are available, display MSG-191. |
| --- | --- | --- |

#### UC71: Confirm Carrier Selection

##### Use Case Description

| **Name** | **Confirm Carrier Selection** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to select and confirm a carrier for their order's shipment. The freight cost is recorded based on the agreed carrier quotation. The confirmed freight rate is immutably stored in the transport order. Shipment order creation is triggered automatically. The system validates the Buyer's credit limit before confirming. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff selects a carrier quotation and clicks "Confirm Carrier". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Order has at least one received freight quotation.Order status is CONFIRMED (finalized purchase terms). |
| --- | --- |
| **Post-condition** | Carrier is confirmed. Freight rate is immutably recorded. Shipment order is auto-created. Carrier and Supplier notified within < 30 s. |
| --- | --- |

##### Activities FLow

#### 

##### 

##### Sequence FLow

#### 

#### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-438 | **Single Carrier Selection:** Only one carrier may be selected per shipment. System rejects attempts to select multiple carriers for the same order. |
| --- | --- | --- |
| (3) | BR-439 | **Credit Limit Validation at Selection:** System invokes credit limit service to verify outstanding_balance + freight_cost <= credit_limit. Validation must complete within < 2s. If exceeded, order transitions to PENDING_CREDIT_APPROVAL and MSG-194 is displayed; flow is aborted. |
| --- | --- | --- |
| (4) | BR-440 | **Delivery Constraint Alignment Check:** System verifies the selected carrier's estimated_delivery_date satisfies the agreed final_delivery_date. If carrier ETA exceeds agreed delivery date, display MSG-193 warning. Buyer must acknowledge before proceeding. |
| --- | --- | --- |
| (6) | BR-441 | **Freight Rate Immutability:** Execute: UPDATE TransportOrders SET confirmed_freight_rate=@Rate, carrier_confirmed_at=UTC_TIMESTAMP(), is_rate_locked=1. Once is_rate_locked=1, the freight rate cannot be modified by any role. |
| --- | --- | --- |
| (7) | BR-442 | **Auto Shipment Order Creation:** Confirming a carrier automatically triggers creation or activation of the associated TransportOrder with status PENDING_DISPATCH. No manual dispatcher action required. |
| --- | --- | --- |
| (8) | BR-443 | **Notification SLA:** System publishes EVENT_CARRIER_SELECTED. INF-SVC-01 notifies the confirmed Carrier and linked Supplier with shipment details within < 30s. |
| --- | --- | --- |
| (5) | BR-444 | **Confirmation Dialog & Audit Logging:** System displays MSG-195 confirmation dialog before executing. Record into System_Audit: { action: 'CONFIRM_CARRIER', target: @TransportOrderID, metadata: { carrier_workspace_id: @CarrierWS, freight_rate: @Rate } }. Trigger MSG-196 on success. |
| --- | --- | --- |

#### 

#### UC72: Review e-POD Evidence

##### Use Case Description

| **Name** | **Review e-POD Evidence** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to review the electronic Proof of Delivery (e-POD) submitted by the driver, including delivery photos, recipient signature, GPS coordinates, and submission timestamp. After review, the Buyer can accept the delivery or raise a dispute. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff opens the delivery confirmation tab on an order in COMPLETED (e-POD submitted) status. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher and is an authorized participant of the shipment.e-POD has been submitted by the driver (TransportOrder status = COMPLETED). |
| --- | --- |
| **Post-condition** | e-POD evidence is displayed via signed URLs. Buyer accepts or initiates dispute. |
| --- | --- |

##### Activities FLow

#### 

##### 

##### Sequence FLow

#### 

#### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-445 | **Shipment Participant Authorization:** Only users involved in the specific shipment (Buyer, Supplier, Carrier) can access e-POD records. System verifies: SELECT \* FROM Shipment_Participants WHERE transport_order_id=@OrderID AND (user_id=@UserID OR workspace_id=@WS_ID). Non-participants receive HTTP 403 and MSG-197. |
| --- | --- | --- |
| (2) | BR-446 | **Signed URL File Access:** All e-POD files (photos, signature) are accessed only via signed URLs with TTL=1 hour. System generates a fresh signed URL per file on each page load. Direct storage URLs are never returned to any client. |
| --- | --- | --- |
| (3) | BR-447 | **e-POD Display Data:** System renders: delivery photo(s), recipient signature image, GPS coordinates on a map pin, check-in timestamp, and driver name only. Driver phone number is never exposed to Buyer in any API response. |
| --- | --- | --- |
| (5) | BR-448 | **Buyer Action Options — Mutually Exclusive & Irreversible:** After reviewing e-POD, Buyer may: (a) Accept Delivery — triggers goods receipt confirmation (UC73). (b) Raise Dispute — opens dispute filing flow (UC76). Both actions are mutually exclusive and irreversible. MSG-198 is shown as an informational notice before Buyer takes action. |
| --- | --- | --- |

#### 

#### UC73: Confirm Goods Receipt

##### Use Case Description

| **Name** | **Confirm Goods Receipt** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to formally confirm goods receipt after reviewing the e-POD evidence. If the Buyer does not respond within 48 hours, the system automatically confirms receipt. Upon confirmation, the payable is recorded immediately and the Supplier's reputation score is updated automatically. |
| --- | --- |
| **Actor** | Buyer Staff (manual), System (auto-confirm) |
| --- | --- |
| **Trigger** | Buyer Staff clicks "Confirm Receipt" on the delivery confirmation page, OR 48 hours elapse after e-POD submission without Buyer action. |
| --- | --- |
| **Pre-condition** | e-POD has been submitted (TransportOrder status = COMPLETED).Goods receipt has not yet been confirmed. |
| --- | --- |
| **Post-condition** | Goods receipt is confirmed. Payable is recorded immediately. Supplier reputation score update is queued. Confirmation is immutable. |
| --- | --- |

##### Activities FLow

#### 

##### 

##### Sequence FLow

#### 

#### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1)-(2) | BR-449 | **Manual Confirmation:** Buyer Staff clicks "Confirm Receipt." System displays MSG-199 confirmation dialog. On confirm: INSERT INTO GoodsReceipts (order_id, confirmed_by, confirmed_at, confirmation_type='MANUAL'). The confirmation is immediately immutable. Trigger MSG-200 on success. |
| --- | --- | --- |
| (3) | BR-450 | **Auto-Confirmation After 48 Hours:** Scheduled job runs every 15 minutes. For COMPLETED transport orders where goods receipt is pending and (UTC_TIMESTAMP() - epod_submitted_at) >= 172800s: INSERT INTO GoodsReceipts (..., confirmation_type='AUTO'). Buyer is notified via MSG-201. |
| --- | --- | --- |
| (4) | BR-451 | **Immediate Payable Recording:** Upon confirmation (manual or auto), system immediately creates: INSERT INTO Payables (order_id, amount=@FinalOrderValue, due_date=@PaymentTermsDate, status='UNPAID', created_at=UTC_TIMESTAMP()). No manual ledger step is required. |
| --- | --- | --- |
| (5) | BR-452 | **Reputation Score Update Trigger:** System publishes EVENT_GOODS_RECEIPT_CONFIRMED to the reputation scoring service. Supplier's score is recalculated asynchronously based on on-time delivery rate and dispute-free delivery rate for the trailing period. |
| --- | --- | --- |
| (6) | BR-453 | **Confirmation Immutability:** Once a GoodsReceipts record is created, it cannot be updated or deleted by any role. Disputes must be handled through the formal dispute process (UC76) and do not retroactively alter the receipt record. |
| --- | --- | --- |

#### 

#### UC74: Execute 3-Way Matching (Buyer)

##### Use Case Description

| **Name** | **Execute 3-Way Matching (Buyer)** |
| --- | --- |
| **Description** | This use case allows a Buyer Chief Accountant to perform 3-way matching of the Purchase Order, Goods Receipt Note, and Invoice to verify payment accuracy. The system displays a side-by-side comparison with automatic discrepancy highlighting. Payment is blocked until matching is confirmed. All documents are permanently locked after confirmation. |
| --- | --- |
| **Actor** | Buyer Chief Accountant |
| --- | --- |
| **Trigger** | Buyer Chief Accountant opens the 3-way matching screen for an order with a confirmed goods receipt and a finalized invoice. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_CHIEF_ACCOUNTANT or higher, or is an authorized participant.Order has a confirmed GoodsReceipt and a FINALIZED invoice.Order has not already been matched. |
| --- | --- |
| **Post-condition** | Matching result is recorded. Payment is unblocked (if matched or approved with exception). All linked documents are permanently locked. Audit log entry created. |
| --- | --- |

##### Activities FLow

### 

##### 

##### Sequence FLow

### 

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-454 | **Access Control:** Only BUYER_CHIEF_ACCOUNTANT and authorized roles for this specific order can access the matching screen. HTTP 403 for unauthorized users. Enforced at API layer. |
| --- | --- | --- |
| (2) | BR-455 | **Comparison Dashboard Load:** System displays side-by-side: (a) PO data (quantity, unit_price, total). (b) Goods Receipt Note (received_quantity). (c) Invoice (billed_quantity, unit_price, total). Performance: all three sources load within < 5s. |
| --- | --- | --- |
| (3) | BR-456 | **Automatic Discrepancy Highlighting:** Any field where values differ across the three documents is highlighted in yellow. A discrepancy summary row shows variance amounts. |
| --- | --- | --- |
| (4) | BR-457 | **Mandatory Discrepancy Justification:** If discrepancies exist, \[btnConfirmMatch\] is disabled until justification is entered (min 1 non-whitespace character). If empty on submit attempt, display MSG-202. |
| --- | --- | --- |
| (5) | BR-458 | **Manual Confirmation Required:** Chief Accountant must explicitly click \[btnConfirmMatch\]. System displays MSG-203 confirmation dialog: "Confirm 3-way match for Order \[ID\]? This action is irreversible." |
| --- | --- | --- |
| (6) | BR-459 | **Post-Confirmation Atomic Transaction:** Execute in a single transaction: (a) UPDATE Orders SET matching_status=@Status, matched_by=@UserID, matched_at=UTC_TIMESTAMP(), is_locked=1. (b) UPDATE GoodsReceipts SET is_locked=1 WHERE order_id=@OrderID. (c) UPDATE Invoices SET is_locked=1 WHERE order_id=@OrderID. (d) UPDATE Payables SET status='PAYMENT_ALLOWED'. All four must succeed atomically; partial failure is rolled back. |
| --- | --- | --- |
| (7) | BR-460 | **Payment Block Until Match:** Before matching is confirmed, any payment execution attempt for this order is blocked with MSG-204: WHERE order_id=@OrderID AND matching_status IS NULL → reject payment attempt. |
| --- | --- | --- |
| (8) | BR-461 | **Matching Status Values & Success Feedback:** Allowed values: MATCHED, MISMATCHED (approved with documented justification). No other values permitted. Trigger MSG-205 on success. |
| --- | --- | --- |
| (9) | BR-462 | **Audit Logging:** Record into System_Audit: { action: 'CONFIRM_3WAY_MATCHING_BUYER', actor: @UserID, target: @OrderID, metadata: { status: @Status, justification: @Justification } }. |
| --- | --- | --- |

#### 

#### UC75: Execute Payment

##### Use Case Description

| **Name** | **Execute Payment** |
| --- | --- |
| **Description** | This use case allows a Buyer Chief Accountant to execute payment for orders that have been approved through 3-way matching. Only matched or approved-with-exception orders can be paid. Payment amount must match the approved invoice. Upon execution, the Supplier is notified and payment records are immediately immutable. |
| --- | --- |
| **Actor** | Buyer Chief Accountant |
| --- | --- |
| **Trigger** | Buyer Chief Accountant opens the payment queue and executes payment for an eligible order. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_CHIEF_ACCOUNTANT or higher.Order matching_status is MATCHED or MISMATCHED (approved with exception).Payable status is PAYMENT_ALLOWED.Outstanding payable balance > 0. |
| --- | --- |
| **Post-condition** | Payment is recorded. Payable status transitions to PAID. Supplier is notified. Payment record is immutable. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-463 | **Payment Eligibility Check:** System verifies: SELECT matching_status FROM Orders WHERE id=@OrderID. If status is not MATCHED or MISMATCHED-approved, display MSG-206 and reject payment. |
| --- | --- | --- |
| (2) | BR-464 | **Payment Amount Validation:** Payment amount must exactly equal Payables.amount for the order. System rejects partial payments and overpayments: IF @PaymentAmount != Payables.amount, display MSG-207 and block submission. |
| --- | --- | --- |
| (4) | BR-465 | **Payment Execution:** Execute: INSERT INTO Payments (order_id, amount, payment_date, payment_method, reference_number, executed_by, executed_at). Then: UPDATE Payables SET status='PAID', paid_at=UTC_TIMESTAMP(). Execution must complete within < 5s. |
| --- | --- | --- |
| (5) | BR-466 | **Payment Record Immutability:** Once a payment record is inserted, no UPDATE or DELETE is permitted by any role. Corrections require a new reversal or adjustment record referencing the original. |
| --- | --- | --- |
| (6) | BR-467 | **Supplier Notification SLA & Success Feedback:** System publishes EVENT_PAYMENT_EXECUTED. INF-SVC-01 notifies Supplier with payment confirmation, amount, and reference number within < 30s. Trigger MSG-209 on success. Display MSG-208 for confirmation before execution. |
| --- | --- | --- |
| (7) | BR-468 | **Audit Logging:** Record into System_Audit: { action: 'EXECUTE_PAYMENT', actor: @UserID, target: @PaymentID, metadata: { order_id: @OrderID, amount: @Amount } }. |
| --- | --- | --- |

#### 

#### UC76: File Formal Complaint

##### Use Case Description

| **Name** | **File Formal Complaint** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to file a formal complaint against a supplier or carrier related to a specific order. The complaint requires a description, evidence, and a linked order ID. Complaints are created with status OPEN and are visible to the Buyer throughout their lifecycle. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff clicks "File Complaint" on an order detail page or from the Dispute Management section. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Target order exists and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Complaint is persisted with status OPEN. Complaint is visible to Buyer. Action is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-469 | **Mandatory Complaint Fields:** Required: order_id, complaint_against (SUPPLIER or CARRIER), description (min 20 characters), and at least one evidence file (JPG/PNG/PDF ≤10MB each). Evidence must be uploaded to INF-SVC-02 before submission. If any missing, display MSG-210 and block. |
| --- | --- | --- |
| (3) | BR-470 | **Order Linkage Validation:** System verifies: SELECT workspace_id FROM Orders WHERE id=@OrderID. If workspace_id != requesting user's workspace_id, reject with HTTP 403. |
| --- | --- | --- |
| (5) | BR-471 | **Complaint Status Lifecycle:** Valid statuses in sequence: OPEN → IN_PROGRESS → ESCALATED → RESOLVED. Complaints are created with status=OPEN. Status transitions must follow this sequence; skipping states is rejected. |
| --- | --- | --- |
| (5) | BR-472 | **Complaint Persistence:** Execute: INSERT INTO Complaints (order_id, filed_by, complaint_against, description, evidence_file_ids, status='OPEN', filed_at=UTC_TIMESTAMP()). |
| --- | --- | --- |
| (6) | BR-473 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'FILE_COMPLAINT', actor: @UserID, target: @ComplaintID, metadata: { order_id: @OrderID, complaint_against: @Target } }. Trigger MSG-211 on success (includes complaint case number). |
| --- | --- | --- |

####   
UC77: Escalate Dispute To Admin

##### Use Case Description

| **Name** | **Escalate Dispute To Admin** |
| --- | --- |
| **Description** | This use case allows a Buyer Staff member to escalate an unresolved complaint to the Platform Admin for neutral-party intervention. Escalation is only permitted for complaints in IN_PROGRESS status. A mandatory escalation reason must be provided. Admin is notified within 1 minute. |
| --- | --- |
| **Actor** | Buyer Staff |
| --- | --- |
| **Trigger** | Buyer Staff opens a complaint in IN_PROGRESS status and clicks "Escalate to Admin". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: BUYER_STAFF or higher.Target complaint exists with status IN_PROGRESS and belongs to the user's workspace. |
| --- | --- |
| **Post-condition** | Complaint status transitions to ESCALATED. Platform Admin is notified within < 1 min. Escalation is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-474 | **Status Pre-Check:** System verifies: SELECT status FROM Complaints WHERE id=@ComplaintID AND workspace_id=@WS_ID. If status != IN_PROGRESS, display MSG-212 and reject escalation. |
| --- | --- | --- |
| (2) | BR-475 | **Mandatory Escalation Reason:** System presents MSG-214 confirmation modal with a required reason field. \[btnConfirmEscalation\] remains disabled until reason contains at least 1 non-whitespace character. If empty on submit attempt, display MSG-213. Reason is stored permanently in Complaints.escalation_reason. |
| --- | --- | --- |
| (3) | BR-476 | **State Transition with Guard:** Execute: UPDATE Complaints SET status='ESCALATED', escalated_by=@UserID, escalated_at=UTC_TIMESTAMP(), escalation_reason=@Reason WHERE id=@ComplaintID AND status='IN_PROGRESS'. The AND status='IN_PROGRESS' clause prevents concurrent escalations. |
| --- | --- | --- |
| (4) | BR-477 | **Admin Notification SLA:** System publishes EVENT_COMPLAINT_ESCALATED. INF-SVC-01 notifies all Platform Admin users with complaint details and direct link. Constraint: notification delivered within < 1 minute. |
| --- | --- | --- |
| (5) | BR-478 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'ESCALATE_COMPLAINT', actor: @UserID, target: @ComplaintID, metadata: { reason: @Reason } }. Trigger MSG-215 on success. |
| --- | --- | --- |

### HR

#### UC78: Create Employee Profile & Account

##### Use Case Description

| **Name** | **Create Employee Profile & Account** |
| --- | --- |
| **Description** | This use case allows an HR Manager to create a new employee profile and system account. Upon saving, a system account is auto-created and an activation email is sent. For Driver department employees, additional mandatory fields are revealed (ID card images). Driver accounts are enabled for mobile app login and appear in the dispatcher's dropdown immediately upon activation. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager navigates to Employee Management and clicks "Add Employee". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Workspace is ACTIVE. |
| --- | --- |
| **Post-condition** | Employee profile and system account are created. Activation email sent within < 30 s. For Drivers, profile appears in dispatch dropdown upon activation. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-479 | **Email Uniqueness (Real-Time):** On blur of email field, system calls GET /users/check-email. Query: SELECT COUNT(\*) FROM Users WHERE email=@Email AND workspace_id=@WS_ID. If count > 0, show inline MSG-216 and disable \[btnSave\]. |
| --- | --- | --- |
| (5) | BR-480 | **Common Mandatory Fields:** All employees require: full_name, email (unique within workspace), phone_number, national_id, avatar (JPG/PNG ≤5MB), role, department, date_of_birth. If any missing on submit, display MSG-217 and block submission. |
| --- | --- | --- |
| (6) | BR-481 | **Auto Account Creation:** System creates account inactive: INSERT INTO Users (workspace_id, email, role, department, is_active=0, created_by=@UserID, created_at=UTC_TIMESTAMP()). Account is inactive until employee clicks the activation link. |
| --- | --- | --- |
| (7) | BR-482 | **Activation Email SLA:** System publishes EVENT_ACCOUNT_CREATED. INF-SVC-01 sends activation email to employee email address within < 30s. Activation link TTL=72 hours. Trigger MSG-220 on successful profile save. |
| --- | --- | --- |
| (3) | BR-483 | **Driver-Specific Mandatory Fields:** When department=DRIVER, system reveals additional mandatory fields: id_card_front (JPG/PNG ≤5MB) and id_card_back (JPG/PNG ≤5MB). Both are mandatory. If either missing on submit, display MSG-218. Not shown for other departments. |
| --- | --- | --- |
| (8) | BR-484 | **ID Card Signed URL Storage:** Driver id_card images are stored in INF-SVC-02 with private access policy. Access is only via signed URLs with TTL=1 hour. Direct URLs are never returned to any client. |
| --- | --- | --- |
| (9) | BR-485 | **Driver Dispatch Availability on Activation:** Upon account activation (is_active → 1), if role=DRIVER, system updates Drivers.status='AVAILABLE' and publishes EVENT_DRIVER_ACTIVATED. Driver appears immediately in dispatcher dropdown without page reload: WHERE role='DRIVER' AND is_active=1 AND status='AVAILABLE'. |
| --- | --- | --- |
| (6) | BR-486 | **Role Spoofing Prevention:** Role and department values submitted in the creation form are validated server-side against allowed enum values for the workspace type. UI manipulation cannot assign elevated roles. Enforced at API layer — invalid values rejected with HTTP 400. |
| --- | --- | --- |
| (4) | BR-487 | **Image File Validation:** Each uploaded image (avatar, ID cards) must be JPG or PNG, max 5MB. Validated client-side on file selection. If invalid, display MSG-219 and exclude the file from upload. Final validation also enforced server-side. |
| --- | --- | --- |
| (9) | BR-488 | **Audit Logging:** Record into System_Audit: { action: 'CREATE_EMPLOYEE', actor: @UserID, target: @EmployeeID, metadata: { ip: @IP, timestamp: @TS, role: @Role, department: @Dept } }. |
| --- | --- | --- |

#### UC79: Manage Employee Roles

##### Use Case Description

| **Name** | **Manage Employee Roles** |
| --- | --- |
| **Description** | This use case allows an HR Manager to change an employee's system role, updating their access permissions. Only HR can perform role changes. New permissions take effect immediately within 5 seconds without requiring a service restart. Every role change is recorded in the audit log. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager opens an employee profile and changes the role field. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Target employee exists and belongs to the same workspace. |
| --- | --- |
| **Post-condition** | Role is updated. New permissions are active within < 5 s. Change is recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-490 | **Valid Role Transition:** New role must be a valid enum for the workspace type (Supplier/Buyer/Carrier). Invalid or non-existent roles are rejected with MSG-221. |
| --- | --- | --- |
| (3) | BR-491 | **Role Change Confirmation Dialog:** System displays MSG-222 showing current role and new role before applying change. HR Manager must explicitly confirm before execution. |
| --- | --- | --- |
| (4) | BR-492 | **Role Change Persistence:** Execute: UPDATE Users SET role=@NewRole, updated_by=@UserID, updated_at=UTC_TIMESTAMP() WHERE id=@EmployeeID AND workspace_id=@WS_ID. Simultaneously invalidate all active session tokens for the affected user, forcing re-authentication with the new role. |
| --- | --- | --- |
| (5) | BR-493 | **Immediate Permission Propagation:** System publishes EVENT_ROLE_CHANGED. All active sessions for the affected user are invalidated. New permissions are enforced on the user's next API call within < 5s. No service restart required. |
| --- | --- | --- |
| (6) | BR-494 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'CHANGE_EMPLOYEE_ROLE', actor: @UserID, target: @EmployeeID, metadata: { old_role: @OldRole, new_role: @NewRole } }. Trigger MSG-223 on success. |
| --- | --- | --- |

#### UC80: Deactivate Employee Account

##### Use Case Description

| **Name** | **Deactivate Employee Account** |
| --- | --- |
| **Description** | This use case allows an HR Manager to deactivate an employee account, immediately revoking all system access. All active sessions are force-logged out within 5 seconds. For Driver employees, the driver is additionally blocked from mobile app login, removed from active vehicle assignments, and removed from dispatch dropdowns. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager opens an employee profile and clicks "Deactivate Account". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Target employee account is currently ACTIVE. |
| --- | --- |
| **Post-condition** | Account is deactivated. All sessions force-logged out within < 5 s. Deactivation recorded in audit log. Driver-specific cleanup applied if applicable. |
| --- | --- |

##### Activities FLow

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (4) | BR-495 | **Deactivation Persistence:** Execute: UPDATE Users SET is_active=0, deactivated_by=@UserID, deactivated_at=UTC_TIMESTAMP() WHERE id=@EmployeeID AND workspace_id=@WS_ID. |
| --- | --- | --- |
| (4) | BR-496 | **Force Session Termination:** System immediately invalidates all active session tokens for the deactivated user within < 5s of deactivation. No new login is permitted while is_active=0. |
| --- | --- | --- |
| (5) | BR-497 | **Driver-Specific Cleanup:** If role=DRIVER, system executes: (a) UPDATE Drivers SET status='INACTIVE'. (b) UPDATE Driver_Vehicle_Assignments SET is_active=0, unassigned_at=UTC_TIMESTAMP(), unassigned_reason='DRIVER_DEACTIVATED' WHERE driver_id=@DriverID AND is_active=1. (c) UPDATE Vehicles SET is_available=1 WHERE id=@AssignedVehicleID. (d) Dispatch dropdown refreshes to exclude the driver within < 1s. |
| --- | --- | --- |
| (6) | BR-498 | **Login Block:** Deactivated accounts cannot authenticate via web or mobile app. If a deactivated user attempts login, system returns HTTP 401. No error detail is returned beyond the standard unauthorized response. |
| --- | --- | --- |
| (2) | BR-499 | **Active Trip Driver Guard:** If the deactivated employee is a DRIVER with an active trip (TransportOrders.status='ON_TRIP'), system displays MSG-225 warning before the standard confirmation (MSG-224). HR must acknowledge both before proceeding. |
| --- | --- | --- |
| (7) | BR-500 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'DEACTIVATE_EMPLOYEE', actor: @UserID, target: @EmployeeID, metadata: { role: @Role, vehicle_unassigned: @VehicleID\|null } }. Trigger MSG-226 on success. |
| --- | --- | --- |

#### UC81: Reactivate Employee Account

##### Use Case Description

| **Name** | **Reactive Employee Account** |
| --- | --- |
| **Description** | This use case allows an HR Manager to reactivate a previously deactivated employee account, restoring the employee's system access immediately. The employee receives an activation notification. Reactivation is recorded in the audit log. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager opens a deactivated employee profile and clicks "Reactivate Account". |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Target employee account has status is_active = 0. |
| --- | --- |
| **Post-condition** | Account is reactivated immediately. Employee can log in. Employee receives notification. Reactivation recorded in audit log. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (3) | BR-501 | **Reactivation Persistence:** Execute: UPDATE Users SET is_active=1, reactivated_by=@UserID, reactivated_at=UTC_TIMESTAMP() WHERE id=@EmployeeID AND workspace_id=@WS_ID AND is_active=0. The AND is_active=0 guard prevents no-op reactivation of already-active accounts. |
| --- | --- | --- |
| (5) | BR-502 | **Driver Dispatch Re-Enrollment:** If role=DRIVER, system executes: UPDATE Drivers SET status='AVAILABLE'. System publishes EVENT_DRIVER_ACTIVATED. Driver reappears in the dispatcher's dropdown immediately upon reactivation without page reload. |
| --- | --- | --- |
| (6) | BR-503 | **Employee Notification:** System publishes EVENT_ACCOUNT_REACTIVATED. INF-SVC-01 sends email notification to the employee's registered email address informing them their account has been reactivated and they may log in. |
| --- | --- | --- |
| (2) | BR-504 | **Reactivation Confirmation Dialog:** System displays MSG-227 before executing reactivation. HR Manager must explicitly confirm. Button only visible for accounts with is_active=0. |
| --- | --- | --- |
| (7) | BR-505 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'REACTIVATE_EMPLOYEE', actor: @UserID, target: @EmployeeID, metadata: { ip: @IP, timestamp: @TS } }. Trigger MSG-228 on success. |
| --- | --- | --- |

#### UC82: Monitor Employee KPI Dashboard

##### Use Case Description

| **Name** | **Monitor Employee KPI Dashboard** |
| --- | --- |
| **Description** | This use case allows an HR Manager to view a KPI performance dashboard for all employees within their workspace. The dashboard displays KPI metrics per employee, filterable by period, department, and KPI type. KPI metrics vary by employee role. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager navigates to the KPI Dashboard page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Workspace is ACTIVE. |
| --- | --- |
| **Post-condition** | KPI dashboard is rendered with current metrics for all employees. |
| --- | --- |

##### 

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-506 | **Workspace-Scoped Metrics:** Dashboard displays only employees belonging to the requesting user's workspace: WHERE workspace_id=@WS_ID. Cross-workspace data is never included. Access restricted to HR_MANAGER or higher. |
| --- | --- | --- |
| (2) | BR-507 | **Role-Specific KPI Metrics:** KPI types vary by role. Examples: Supplier Sales Staff — order_response_time, quotation_win_rate. Buyer Staff — rfq_processing_time, order_completion_rate. Driver — on_time_delivery_rate, incident_rate. Carrier Dispatcher — dispatch_turnaround_time. |
| --- | --- | --- |
| (3) | BR-508 | **Filter Parameters:** System supports: period (current_month / last_quarter / custom date range), department, kpi_type. All filters are AND conditions. |
| --- | --- | --- |
| (4) | BR-509 | **KPI Completion Display:** Per employee-KPI pair: target_value, actual_value, completion_pct=ROUND((actual/target)\*100,2). Color-coded indicators: green (≥100%), yellow (70–99%), red (<70%). If no data for selected filters, display MSG-229. |
| --- | --- | --- |
| (6) | BR-510 | **Performance Constraint:** Dashboard must render within < 3s for up to 200 employees. Required indexes: (workspace_id, department), (employee_id, kpi_type, period). |
| --- | --- | --- |

#### UC83: Set Employee KPI Targets

##### Use Case Description

| **Name** | **Set Employee KPI Targets** |
| --- | --- |
| **Description** | This use case allows an HR Manager to set KPI targets for individual employees for a specific period. Targets are visible to the employee on their personal KPI dashboard. Every target-setting action is recorded in the audit log. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager opens an employee's KPI profile and sets or updates KPI targets for a period. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.Target employee exists and belongs to the same workspace. |
| --- | --- |
| **Post-condition** | KPI targets are persisted per employee per period. Visible to employee immediately. Action recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-511 | **Target Fields:** Each KPI target record requires: employee_id, kpi_type (valid enum for role), period (e.g., 2025-Q1), target_value (positive number), weight (percentage). Optional: notes. HR may set or update multiple KPI targets per employee per period. |
| --- | --- | --- |
| (3) | BR-512 | **Weight Sum Validation:** System validates the sum of all KPI weights for a given employee-period. If total != 100% after the save, display MSG-230 as a warning. Draft save is allowed; final scoring is blocked until weights sum to 100%. |
| --- | --- | --- |
| (4) | BR-513 | **Period Uniqueness Per KPI:** Only one target record per (employee_id, kpi_type, period) combination is allowed. If a target already exists, operation performs UPDATE rather than INSERT (UPSERT pattern). |
| --- | --- | --- |
| (5) | BR-514 | **Immediate Employee Visibility:** Saved targets are immediately visible on the employee's personal KPI progress page without page reload. System publishes EVENT_KPI_TARGET_SET. |
| --- | --- | --- |
| (6) | BR-515 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'SET_KPI_TARGET', actor: @UserID, target: @EmployeeID, metadata: { period: @Period, kpi_type: @KPIType, target_value: @Value } }. Trigger MSG-231 on success. |
| --- | --- | --- |

#### UC84: Update KPI Results

##### Use Case Description

| **Name** | **Update KPI Results** |
| --- | --- |
| **Description** | This use case allows an HR Manager to enter end-of-period KPI actual results for employees. Upon saving, the system automatically calculates the completion percentage. Results are immediately visible on the employee's KPI profile. KPI targets and weights are configurable without code deployment. |
| --- | --- |
| **Actor** | HR Manager |
| --- | --- |
| **Trigger** | HR Manager opens an employee's KPI result entry form for a specific period and saves the actual values. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: HR_MANAGER or higher.KPI targets have been set for the employee-period combination. |
| --- | --- |
| **Post-condition** | KPI actual results are persisted. Completion percentage is auto-calculated. Results visible on employee profile immediately. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-516 | **Result Fields:** Each KPI result entry requires: employee_id, kpi_type, period, actual_value (non-negative number). Optional: notes. If actual_value is negative, display MSG-232 and block submission. |
| --- | --- | --- |
| (3) | BR-517 | **Auto-Calculation of Completion Percentage:** Upon save, system calculates: completion_pct=ROUND((actual_value/target_value)\*100,2). Percentage is stored with the result record and displayed on employee KPI dashboard in real time. |
| --- | --- | --- |
| (5) | BR-518 | **No-Code KPI Configuration:** KPI types, weights, and display formats are defined in a configurable KPI_Config table. Changes take effect immediately for new periods without code deployment. Existing period results are unaffected by configuration changes. |
| --- | --- | --- |
| (4) | BR-519 | **Immediate Widget Update:** After saving results, the employee's KPI progress bar widget refreshes automatically within < 1s via EVENT_KPI_RESULT_UPDATED. No page reload required. |
| --- | --- | --- |
| (6) | BR-520 | **Audit Logging & Success Feedback:** Record into System_Audit: { action: 'UPDATE_KPI_RESULT', actor: @UserID, target: @EmployeeID, metadata: { period: @Period, kpi_type: @KPIType, actual_value: @Value, completion_pct: @Pct } }. Trigger MSG-233 on success. |
| --- | --- | --- |

#### UC85: Track Personal KPI Progress

##### Use Case Description

| **Name** | **Track Personal KPI Progress** |
| --- | --- |
| **Description** | This use case allows any authenticated employee to view their own KPI targets, actual results, and completion percentage for current and past periods. The progress dashboard updates immediately when HR enters new results. Employees can only view their own KPI data. |
| --- | --- |
| **Actor** | All authenticated employees |
| --- | --- |
| **Trigger** | Employee navigates to "My KPI Progress" from their personal dashboard. |
| --- | --- |
| **Pre-condition** | User is authenticated with a valid session.KPI targets have been set for the employee for at least one period. |
| --- | --- |
| **Post-condition** | Personal KPI progress dashboard is displayed with current and historical data. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-521 | **Self-View Only Restriction:** System enforces: WHERE employee_id=@CurrentUserID. Any attempt to access another employee's KPI data via URL manipulation (e.g., changing ?employee_id= in query string) returns HTTP 403. Enforced at API layer. |
| --- | --- | --- |
| (2) | BR-522 | **Dashboard Display:** System renders per-KPI: target_value, actual_value, completion_pct (progress bar with color-coding: green ≥100%, yellow 70–99%, red <70%), and HR notes if any. If no targets for the selected period, display MSG-234. |
| --- | --- | --- |
| (3) | BR-523 | **Multi-Period View:** Employee can switch between current and past periods using a period selector dropdown. Historical data is displayed in read-only format and cannot be modified by the employee. |
| --- | --- | --- |
| (5) | BR-524 | **Real-Time Progress Update:** When HR saves a new KPI result for the employee, system publishes EVENT_KPI_RESULT_UPDATED. Employee's progress bar widget updates within < 1s via WebSocket push. No page reload required. |
| --- | --- | --- |

#### UC86: View Organizational KPI Dashboard

##### Use Case Description

| **Name** | **View Organizational KPI Dashboard** |
| --- | --- |
| **Description** | This use case allows a Company Admin to view an organization-wide KPI dashboard showing completion rates by department and individual employee. The dashboard is filterable by period and department. Data can be exported to XLSX for further analysis. |
| --- | --- |
| **Actor** | Company Admin |
| --- | --- |
| **Trigger** | Company Admin navigates to the Organizational KPI Dashboard page. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: COMPANY_ADMIN or higher.Workspace is ACTIVE. |
| --- | --- |
| **Post-condition** | Organizational KPI dashboard is rendered with current completion data. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-525 | **Access Control:** Only COMPANY_ADMIN and higher roles can access the organizational KPI dashboard. HR_MANAGER can only see data scoped to their own workspace. All other roles denied. Enforced at API layer. |
| --- | --- | --- |
| (2) | BR-526 | **Aggregated View:** Dashboard shows two levels: (a) Department level: average completion_pct per department. (b) Employee level: individual completion_pct per employee within each department. |
| --- | --- | --- |
| (3) | BR-527 | **Filter Parameters:** Filterable by: period (current/past/custom) and department. All selected filters are AND conditions and reflected in the exported report header metadata. |
| --- | --- | --- |
| (5) | BR-528 | **XLSX Export:** Export includes: employee_name, department, kpi_type, target_value, actual_value, completion_pct, period. All applied filters reflected in report header. Export completes within < 10s. Trigger MSG-236 on success. If no data for filters, display MSG-235. |
| --- | --- | --- |
| (6) | BR-529 | **Performance Constraint:** Dashboard must render within < 3s for workspaces with up to 500 employees. Required indexes: (workspace_id, department), (employee_id, kpi_type, period). |
| --- | --- | --- |

### Infrastructure

#### UC87: Broadcast System Notifications

##### Use Case Description

| **Name** | **Broadcast System Notifications** |
| --- | --- |
| **Description** | This use case allows a Platform Admin to send system-wide notifications to all users across all workspace within the platform. Notifications are stored persistently and visible in each user's notification center. Every broadcast is recorded in the audit log. |
| --- | --- |
| **Actor** | Platform Admin |
| --- | --- |
| **Trigger** | Platform Admin navigates to the Notification Management page and submits a broadcast notification. |
| --- | --- |
| **Pre-condition** | User is authenticated with role: PLATFORM_ADMIN.Notification message is composed and validated. |
| --- | --- |
| **Post-condition** | Notification is stored and visible in all users' notification centers. Broadcast is recorded in audit log. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-530 | **Mandatory Notification Fields:** Broadcast requires: title (max 200 characters), message_body (max 2000 characters), notification_type (INFO/WARNING/MAINTENANCE). Optional: scheduled_at (future UTC timestamp). If scheduled_at not provided, notification is dispatched immediately. |
| --- | --- | --- |
| (2) | BR-531 | **Field Length & Schedule Validation:** If title exceeds 200 chars or message_body exceeds 2000 chars, display MSG-237 and block submission. If scheduled_at is provided and is not a future time, display MSG-238. |
| --- | --- | --- |
| (3) | BR-532 | **Broadcast Confirmation:** System displays MSG-239 confirmation dialog before executing. Admin must explicitly confirm. This prevents accidental platform-wide notifications. |
| --- | --- | --- |
| (4a) | BR-533 | **Broadcast Scope:** Notification is delivered to ALL active users across ALL workspaces (WHERE is_active=1). System batch-inserts: INSERT INTO UserNotifications (user_id, notification_id, is_read=0, delivered_at=UTC_TIMESTAMP()). Trigger MSG-240 with actual user count on success. |
| --- | --- | --- |
| (5) | BR-534 | **Notification Persistence:** Each notification is stored permanently in Notifications table and visible in user's notification center. Users can mark individual notifications as read. Notifications are never auto-deleted. |
| --- | --- | --- |
| (4b) | BR-535 | **Scheduled Broadcast & Cancellation:** If scheduled_at specified, system queues for delivery at that UTC time (MSG-241). Admin can cancel before delivery via MSG-242 confirmation; cancellation is logged and MSG-243 shown. Cancellation is recorded in audit log. |
| --- | --- | --- |
| (6) | BR-536 | **Audit Logging:** Record into System_Audit: { action: 'BROADCAST_NOTIFICATION', actor: @AdminID, target: 'ALL_USERS', metadata: { title: @Title, type: @Type, scheduled_at: @ScheduledAt\|null } }. |
| --- | --- | --- |

#### UC88: Upload & Secure File Storage

##### Use Case Description

| **Name** | **Upload & Secure File Storage** |
| --- | --- |
| **Description** | This use case covers the platform-wide secure file storage capability available to all authenticated users for uploading images and documents (product images, e-POD photos, invoices, ID cards, etc.). All files are stored without public URLs. Access requires a signed URL. Per-tenant storage quotas are enforced. Concurrent uploads from all tenants are handled. |
| --- | --- |
| **Actor** | All authenticated users |
| --- | --- |
| **Trigger** | An authenticated user or system process triggers a file upload (e.g., product image, e-POD photo, invoice, ID card). |
| --- | --- |
| **Pre-condition** | User is authenticated with a valid session.File meets size and format constraints for its use case. |
| --- | --- |
| **Post-condition** | File is stored securely in INF-SVC-02 without a public URL. A file_id is returned for reference. Storage quota is updated. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### 

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (2) | BR-537 | **File Size Limits by Type:** Product images: max 5MB (JPG/PNG only). Documents (invoices, e-POD): max 10MB (JPG/PNG/PDF). ID card images: max 5MB (JPG/PNG only). If exceeded, display MSG-244 and reject without attempting upload. |
| --- | --- | --- |
| (2) | BR-538 | **File Format Validation:** Each upload context defines allowed formats. If submitted file format is not in the allowed list for its context, display MSG-245 and reject. Validated at both client and server layers. |
| --- | --- | --- |
| (4) | BR-539 | **No Public URL Storage:** All files are stored in INF-SVC-02 with a private access policy. No public URL is ever generated or returned to any client. All file access must go through the signed URL generation service (UC89). |
| --- | --- | --- |
| (4) | BR-540 | **File Metadata Record:** Upon successful upload, system creates: INSERT INTO Files (workspace_id, uploader_id, original_filename, file_type, file_size, storage_key, uploaded_at=UTC_TIMESTAMP()). The storage_key is an internal reference and is never exposed externally. |
| --- | --- | --- |
| (3) | BR-541 | **Per-Tenant Storage Quota Enforcement:** Before each upload, system checks: SELECT SUM(file_size) FROM Files WHERE workspace_id=@WS_ID. If the new file would exceed the workspace quota, display MSG-246 and reject. Quota values are configurable per workspace. |
| --- | --- | --- |
| (6) | BR-542 | **Concurrent Upload Handling:** INF-SVC-02 is designed for concurrent uploads from all tenants without data corruption. Each upload is atomic and isolated. Trigger MSG-247 on successful upload. |
| --- | --- | --- |

#### UC89: Generate Secure Signed URL

##### Use Case Description

| **Name** | **Generate Secure Signed URL** |
| --- | --- |
| **Description** | This use case covers the platform-wide signed URL generation service that provides time-limited, authenticated access to stored files. All sensitive documents (e-POD files, invoices, ID cards, etc.) are accessible exclusively via signed URLs. Direct storage URLs are never exposed. Every URL generation event is logged. |
| --- | --- |
| **Actor** | All authenticated users (via system service) |
| --- | --- |
| **Trigger** | An authenticated user or system process requests access to a stored file (e.g., opening an invoice, viewing an e-POD photo, accessing an ID card image). |
| --- | --- |
| **Pre-condition** | User is authenticated with a valid session.The requested file exists in INF-SVC-02 and the user has access rights to the file. |
| --- | --- |
| **Post-condition** | A time-limited signed URL is returned. The URL expires after the configured TTL. URL generation is logged. |
| --- | --- |

##### Activities FLow

##### 

##### Sequence FLow

##### Business Rules

| **Step (Activity)** | **BR Code** | **Description** |
| --- | --- | --- |
| (1) | BR-543 | **Access Rights Verification:** Before generating a signed URL, system verifies: SELECT workspace_id, access_roles FROM Files WHERE id=@FileID. If the requesting user's workspace or role does not match the file's access policy, system returns HTTP 403 and triggers MSG-248. |
| --- | --- | --- |
| (2) | BR-544 | **Signed URL Generation:** System generates a cryptographically signed URL with: file reference (storage_key), expiry timestamp (UTC_NOW + TTL), requester identity (user_id), and a signature hash preventing URL tampering. The URL is time-limited and non-guessable. |
| --- | --- | --- |
| (3) | BR-545 | **Default TTL Policy:** Default TTL=1 hour (3600 seconds) for all sensitive documents. Applies to: e-POD files, invoices, and ID card images. TTL values are configurable in system settings without code deployment. |
| --- | --- | --- |
| (4) | BR-546 | **Direct URL Prohibition:** The system never returns a direct storage URL (e.g., https://storage.provider.com/bucket/file.pdf) to any client in any API response. All file access endpoints must route through this signed URL generation service. |
| --- | --- | --- |
| (5) | BR-547 | **URL Generation Logging:** Every signed URL generation is logged: INSERT INTO SignedURL_Logs (file_id, requested_by, generated_at, expires_at, requester_ip). This log is used for security audits and access pattern analysis. |
| --- | --- | --- |
| (6) | BR-548 | **Expired URL Behavior:** If a client attempts to access a file using an expired signed URL, the storage service returns HTTP 403 and MSG-249. The platform does not auto-renew expired URLs. The client must request a new signed URL through the platform API. |
| --- | --- | --- |

# List Description

This section provides a comprehensive inventory and description of the data lists and entities maintained within the LogiSync system across its six core domains: Platform, Supplier, Carrier, Buyer, HR, and Infrastructure. These lists facilitate the tracking of business processes such as shipment management, price negotiation, and 3-way matching,... Detailed Reference: For a granular breakdown of data fields and list structures, please refer to the external file:[LogiSync List Description.xlsx](https://docs.google.com/spreadsheets/d/1wydPJpir0Y5KvwWc0TOfIEDbFZuvLKjC/edit?usp=sharing&ouid=112248066051376446975&rtpof=true&sd=true)

# View Description

This section details the User Interface (UI) screens and views designed for the various actors in the system, including Platform Admins, Supplier Staff, Buyers, and Drivers. The views are engineered to support complex logistics workflows while ensuring modularity and clear business logic separation. Detailed Reference: For complete UI mockups and view specifications, please refer to the external file: [LogiSync List View.xlsx](https://docs.google.com/spreadsheets/d/1kL6jGatdnTtivjXesAJw6e52-EYt2z-H/edit?usp=sharing&ouid=112248066051376446975&rtpof=true&sd=true)

# Non-functional Requirements

## 3.1. User Access and Security

| **Actor**<br><br>**Function** | **Platform Admin** | **Company Admin** | **Supplier** | **Carrier** | **Buyer** | **HR Manager** |
| --- | --- | --- | --- | --- | --- | --- |
| Register Workspace |     | x   |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Approve/Reject Workspace | x   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Activate/Deactivate Workspace | x   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Enable Additional Roles |     | x   |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Login / Logout | x   | x   | x   | x   | x   | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Change / Reset Password | x   | x   | x   | x   | x   | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Edit User Profile | x   | x   | x   | x   | x   | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Master Data |     | x   |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| View Audit Logs | x   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Monitor System Health | x   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Products & Categories |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Process Sales Orders |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Assign Order Tasks |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Negotiate Prices |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Respond to RFQ |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Credit Limits |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Perform 3-Way Matching |     |     | x   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Vehicles & Drivers |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Carrier Tariffs |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Submit Freight Quotes |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Dispatch Shipments |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Track Real-time Routes |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Submit e-POD |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Trip Expenses |     |     |     | x   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Create RFQ & Search Products |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Compare Quotes |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Confirm Carrier Selection |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Confirm Goods Receipt |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Process Payments |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Claims |     |     |     |     | x   |     |
| --- | --- | --- | --- | --- | --- | --- |
| Manage Employee Profiles |     |     |     |     |     | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Set KPI Targets |     |     |     |     |     | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Monitor KPI Progress |     |     |     |     |     | x   |
| --- | --- | --- | --- | --- | --- | --- |
| Broadcast Notifications | x   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| Upload & Secure Files | x   | x   | x   | x   | x   | x   |
| --- | --- | --- | --- | --- | --- | --- |

X: User has full permission to do the action.

## 3.2. Performance Requirements

**Number of user**

- Number of concurrent user: 150
- Number of business user: 600 - 700

**Data volume**

- Number of documents: 6M – 8M file size
- Data growth rate: 5MB/ day

**Level of availability**

- 95%: Effective system management (assessed according to IBM standards, continuous operating time per year is no more than 18.25 days).

**Usage frequency**

- The system is used regularly, every hour there will be data exchanged between businesses and their supply partners. Therefore, the system needs to be set up on a server capable of operating throughout business hours. Upgrades, maintenance, and repairs only take place after hours.

**Architecture**

- The system must utilize a Modular Monolith architecture to ensure separation of concerns between Supplier, Carrier, and Buyer modules.

**Data Security**

- All sensitive documents (ID cards, driver licenses, invoices) must be stored in private storage and accessed via Signed URLs with a limited Time-to-Live (TTL).
- Direct cloud storage paths must not be exposed to the client-side.

**Audit Logging**

- Every administrative action (Approval, Rejection, User Modification) must be logged with the actor's ID, IP address, and Timestamp to comply with local regulations (Decree 356/2025).

## 3.3. Implementation Requirements

**Location**

Ho Chi Minh city

**Read-only Duration**

1 day

**Read-only Timeframe**

0:00

**Maintenance Window**

Every week on Sunday evening at 11 p.m., lasting 1 to 2 hours. During this time, programmers can take advantage of it to edit and update new code

**Overall conversion timeline**

1st, 15th and 25th of every month

# Appendixes

## Glossary

The list below contains all the necessary terms to interpret the document, including acronyms and abbreviations.

| **Term** | **Description** |
| --- | --- |
| _BR_ | **B**usiness **R**ule |
| --- | --- |
| _CBR_ | **C**ommon **B**usiness **R**ule |
| --- | --- |
| _DB_ | Notes **D**ata**b**ase |
| --- | --- |
| _MSG_ | **M**es**s**a**g**e |
| --- | --- |
| _UC_ | **U**se **C**ase |
| --- | --- |
| _N/A_ | **N**ot **A**vailable or **N**ot **A**pplicable, used to indicate when information in a certain section could not be provided because it does not apply to this application. |
| --- | --- |
| _UI_ | **U**ser **I**nterface |
| --- | --- |
| _SRS_ | **S**oftware **R**equirements **S**pecification |
| --- | --- |
| _TBD_ | **T**o **b**e **d**etermined or **t**o **b**e **d**efined |
| --- | --- |
| _RFQ_ | **R**equest **f**or **Q**uotation |
| --- | --- |
| _e-POD_ | **E**lectronic **P**roof **o**f **D**elivery |
| --- | --- |
| _Tenant/Workspace_ | A private environment for a specific company on the platform. |
| --- | --- |
| _3-Way Matching_ | The process of verifying Purchase Orders, Receipts, and Invoices. |
| --- | --- |
| _Signed URL_ | A temporary, secure link used to access private cloud storage files. |
| --- | --- |

## Messages

This section describes the details of messages used in business rules e.g. error messages, confirmation messages, etc.

| **Message Code** | **Category** | **Message Content** | **Button** |
| --- | --- | --- | --- |
| MSG 1 | Validation | Invalid Tax ID. Please enter a numeric value between 10 and 13 digits. | OK  |
| --- | --- | --- | --- |
| MSG 2 | Validation | Password does not meet security requirements. | OK  |
| --- | --- | --- | --- |
| MSG 3 | Conflict | Error: A workspace with this Tax ID or Email already exists. | Close |
| --- | --- | --- | --- |
| MSG 4 | Success | Registration complete! Please check your email to verify your account. | Proceed |
| --- | --- | --- | --- |
| MSG 5 | Confirmation | Confirm Workspace Approval: This company will be granted full access to the platform immediately. | Approve / Cancel |
| --- | --- | --- | --- |
| MSG 6 | Success | Workspace has been activated successfully. An automated notification has been sent to the client. | OK  |
| --- | --- | --- | --- |
| MSG 7 | Error | Transaction Failed: This workspace may have already been approved or rejected by another administrator. | Reload |
| --- | --- | --- | --- |
| MSG 8 | Validation | A rejection reason is required to notify the applicant. | OK  |
| --- | --- | --- | --- |
| MSG 9 | Confirmation | Are you sure you want to reject this application? This action cannot be undone. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG 10 | Success | Application rejected. The applicant has been notified of the reason. | OK  |
| --- | --- | --- | --- |
| MSG 11 | Confirmation | Are you sure you want to suspend this workspace? All users in this tenant will be logged out immediately. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG 12 | Success | Workspace suspended. Access has been revoked for all associated users. | OK  |
| --- | --- | --- | --- |
| MSG 13 | Auth | Your workspace has been suspended. Please contact your company administrator. | Close |
| --- | --- | --- | --- |
| MSG-14 | Warning | WARNING: This workspace has {N} active shipments. Revoking access now may result in operational failure and data loss. | Proceed / Cancel |
| --- | --- | --- | --- |
| MSG-15 | Confirmation | To confirm revocation, please type the exact company name: {CompanyName} | \[Confirm Revoke\] |
| --- | --- | --- | --- |
| MSG-16 | Success | Workspace access has been permanently revoked. All sessions terminated. | OK  |
| --- | --- | --- | --- |
| MSG-17 | Error | Confirmation failed. The name entered does not match our records. | Try Again |
| --- | --- | --- | --- |
| MSG-18 | Confirmation | Are you sure you want to enable the following roles? This will grant permission to create users with these functions. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-19 | Success | Roles enabled successfully. New features will be available on your next page refresh. | OK  |
| --- | --- | --- | --- |
| MSG-20 | Error | Access Denied: Only a Company Administrator can modify workspace roles. | Close |
| --- | --- | --- | --- |
| MSG-21 | Error | Your current subscription plan does not support this role. Please upgrade your tier. | Upgrade |
| --- | --- | --- | --- |
| MSG-22 | Auth | Invalid username or password. Please try again. | OK  |
| --- | --- | --- | --- |
| MSG-23 | Security | Account locked due to 5 failed attempts. Please try again in {mm:ss}. | Close |
| --- | --- | --- | --- |
| MSG-24 | Auth | Access Denied: Your workspace is currently suspended or revoked. | Contact Support |
| --- | --- | --- | --- |
| MSG-25 | Success | Login successful. Redirecting to your dashboard... | (Auto) |
| --- | --- | --- | --- |
| MSG-26 | Success | Your password has been updated successfully. All other active sessions have been signed out. | OK  |
| --- | --- | --- | --- |
| MSG-27 | Error | The current password you entered is incorrect. | Try Again |
| --- | --- | --- | --- |
| MSG-28 | Validation | New password and confirmation password do not match. | OK  |
| --- | --- | --- | --- |
| MSG-29 | Validation | Password must be at least 8 characters long and include an uppercase letter, a number, and a special character. | OK  |
| --- | --- | --- | --- |
| MSG-30 | Security | Your new password cannot be the same as your old password. | OK  |
| --- | --- | --- | --- |
| MSG-31 | Info | If your email is registered, a 6-digit OTP has been sent. Please check your inbox. | OK  |
| --- | --- | --- | --- |
| MSG-32 | Validation | The OTP entered is incorrect or has expired. Please request a new one. | Try Again |
| --- | --- | --- | --- |
| MSG-33 | Validation | Your new password and confirmation do not match. | OK  |
| --- | --- | --- | --- |
| MSG-34 | Success | Password reset successful. All other sessions have been signed out. Please login with your new password. | Login |
| --- | --- | --- | --- |
| MSG-35 | Warning | Your session is about to expire due to inactivity. Do you want to stay logged in? \[Countdown: mm:ss\] | Extend Session / Logout |
| --- | --- | --- | --- |
| MSG-36 | Info | Your session has ended for security reasons. Please log in again to continue. | OK  |
| --- | --- | --- | --- |
| MSG-37 | Confirmation | Are you sure you want to disable this master data entry? It will be hidden from all tenants for new operations. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-38 | Success | Master data updated successfully. Changes are now live for all tenants. | OK  |
| --- | --- | --- | --- |
| MSG-39 | Conflict | Error: An entry with this Name already exists in this category. | OK  |
| --- | --- | --- | --- |
| MSG-40 | Validation | Please provide a Name for this entry. | OK  |
| --- | --- | --- | --- |
| MSG-41 | Validation | Capacity values (Payload/Volume) must be greater than zero. | OK  |
| --- | --- | --- | --- |
| MSG-42 | Success | Export complete. Your file is ready for download. | Download |
| --- | --- | --- | --- |
| MSG-43 | Info | No audit records found matching your current filters. | OK  |
| --- | --- | --- | --- |
| MSG-44 | Critical | SYSTEM ALERT: Audit log write failure detected. Integrity monitoring is active. Please contact support. | Dismiss |
| --- | --- | --- | --- |
| MSG-45 | Critical | URGENT: Service {Service_Name} is DOWN. Immediate action required. | View Details |
| --- | --- | --- | --- |
| MSG-46 | Warning | Storage Warning: Tenant {Tenant_Name} has reached 80% of their storage quota. | Notification |
| --- | --- | --- | --- |
| MSG-47 | Success | System health check completed. All services are currently operational. | OK  |
| --- | --- | --- | --- |
| MSG-48 | Confirmation | Are you sure you want to save these changes to your profile? | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-49 | Success | Profile updated successfully. Changes are now active across all sessions. | OK  |
| --- | --- | --- | --- |
| MSG-50 | Info | A verification code has been sent to your new email address. Please enter it to confirm the change. | OK  |
| --- | --- | --- | --- |
| MSG-51 | Error | Invalid or expired verification code. Please try again. | Try Again |
| --- | --- | --- | --- |
| MSG-52 | Validation | Invalid avatar file. Please upload a JPG/PNG image smaller than 2MB. | OK  |
| --- | --- | --- | --- |
| MSG-53 | Validation | Name and Email are mandatory fields. They cannot be left blank. | OK  |
| --- | --- | --- | --- |
| MSG-54 | Confirmation | Are you sure you want to mark this dispute as {Decision}? This action is final and all parties will be notified. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-55 | Success | Dispute resolved successfully. Notifications have been sent to the Buyer, Supplier, and Carrier. | OK  |
| --- | --- | --- | --- |
| MSG-56 | Validation | A resolution note is required to provide a reason for your decision. | OK  |
| --- | --- | --- | --- |
| MSG-57 | Security | Access Denied: You do not have the required permissions to manage escalated disputes. | OK  |
| --- | --- | --- | --- |
| MSG-58 | Info | Supplier reputation scores are updated in real-time based on transaction history. | OK  |
| --- | --- | --- | --- |
| MSG-59 | Security | Access Denied: You do not have permission to view supplier reputation metrics. | OK  |
| --- | --- | --- | --- |
| MSG-60 | Warning | Caution: This supplier has a low reliability score. Please review dispute history before proceeding. | Review |
| --- | --- | --- | --- |
| MSG-61 | Info | Carrier scores are updated automatically based on e-PODs and incident reports. | OK  |
| --- | --- | --- | --- |
| MSG-62 | Security | Access Denied: You are not authorized to view carrier performance metrics. | OK  |
| --- | --- | --- | --- |
| MSG-63 | Warning | Risk Alert: This carrier has a low reliability score or high incident rate. | Details |
| --- | --- | --- | --- |
| MSG-64 | Success | Message sent successfully. | OK  |
| --- | --- | --- | --- |
| MSG-65 | Validation | Cannot send an empty message. Please enter text or attach a file. | OK  |
| --- | --- | --- | --- |
| MSG-66 | Security | Access Denied: You are not a participant in this transaction. | OK  |
| --- | --- | --- | --- |
| MSG-67 | Validation | Invalid file: Only PDF, JPG, PNG, DOCX, XLSX under 5MB are supported. | OK  |
| --- | --- | --- | --- |
| MSG-68 | Confirmation | Are you sure you want to send these attachments? | Send / Cancel |
| --- | --- | --- | --- |
| MSG-69 | Error | A category with this name already exists in your catalog. | OK  |
| --- | --- | --- | --- |
| MSG-70 | Validation | Category name is required and cannot be blank. | OK  |
| --- | --- | --- | --- |
| MSG-71 | Success | Catalog category created successfully. | OK  |
| --- | --- | --- | --- |
| MSG-72 | Error | Access denied: you do not own this catalog category. | Close |
| --- | --- | --- | --- |
| MSG-73 | Success | Catalog category updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-74 | Validation | Invalid SKU: a product with this SKU already exists in your catalog. | OK  |
| --- | --- | --- | --- |
| MSG-75 | Validation | Mandatory fields are missing: Name, SKU, Category, Unit of Measure, and Reference Price are required. | OK  |
| --- | --- | --- | --- |
| MSG-76 | Validation | Image file is invalid. Only JPG/PNG files under 5 MB are allowed. | OK  |
| --- | --- | --- | --- |
| MSG-77 | Success | Product added to catalog successfully. | OK  |
| --- | --- | --- | --- |
| MSG-78 | Success | Product details updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-79 | Warning | This product has {N} open RFQ(s). Hiding it will not cancel those RFQs. Proceed? | Proceed / Cancel |
| --- | --- | --- | --- |
| MSG-80 | Success | Product visibility updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-81 | Info | No products found matching your current filters. | OK  |
| --- | --- | --- | --- |
| MSG-82 | Confirmation | Are you sure you want to approve this order? The Buyer will be notified immediately. | Approve / Cancel |
| --- | --- | --- | --- |
| MSG-83 | Warning | Credit limit exceeded. This order has been routed for credit approval. | OK  |
| --- | --- | --- | --- |
| MSG-84 | Success | Order approved successfully. The Buyer has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-85 | Validation | A denial reason is required to notify the Buyer. | OK  |
| --- | --- | --- | --- |
| MSG-86 | Confirmation | Are you sure you want to deny this order? The Buyer will be notified with the reason provided. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-87 | Success | Order denied. The Buyer has been notified with the stated reason. | OK  |
| --- | --- | --- | --- |
| MSG-88 | Error | Selected staff member is not active or does not belong to this workspace. | OK  |
| --- | --- | --- | --- |
| MSG-89 | Success | Order task assigned successfully. The assignee has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-90 | Error | This staff member is already assigned to this order. | OK  |
| --- | --- | --- | --- |
| MSG-91 | Success | Order task reassigned. Both previous and new assignees have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-92 | Info | No tasks assigned to you at this time. | OK  |
| --- | --- | --- | --- |
| MSG-93 | Error | It is the other party's turn to respond. Please wait for their reply. | OK  |
| --- | --- | --- | --- |
| MSG-94 | Validation | Negotiation round must include a unit price and delivery terms. | OK  |
| --- | --- | --- | --- |
| MSG-95 | Success | Negotiation round submitted. The counterparty has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-96 | Error | Buyer acceptance is required before finalizing this order. | OK  |
| --- | --- | --- | --- |
| MSG-97 | Confirmation | Finalizing this order will permanently lock all terms. This action cannot be undone. Proceed? | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-98 | Success | Order finalized and locked. Both parties have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-99 | Error | Access denied: this RFQ does not belong to your workspace. | Close |
| --- | --- | --- | --- |
| MSG-100 | Success | Quotation submitted successfully. The Buyer has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-101 | Success | Draft quotation saved. | OK  |
| --- | --- | --- | --- |
| MSG-102 | Error | A price list with this name already exists in your workspace. | OK  |
| --- | --- | --- | --- |
| MSG-103 | Validation | Price list must include a name, type, and at least one product-price entry with a positive price. | OK  |
| --- | --- | --- | --- |
| MSG-104 | Success | Fixed price list created successfully. | OK  |
| --- | --- | --- | --- |
| MSG-105 | Confirmation | Buyer {BuyerName} is currently assigned {OldList}. Replace with {NewList}? | Replace / Cancel |
| --- | --- | --- | --- |
| MSG-106 | Success | Price list assigned to partner successfully. Future quotations will use the new pricing. | OK  |
| --- | --- | --- | --- |
| MSG-107 | Validation | Credit limit must be zero or a positive number. | OK  |
| --- | --- | --- | --- |
| MSG-108 | Success | Credit limit updated successfully and is now in effect. | OK  |
| --- | --- | --- | --- |
| MSG-109 | Validation | A bypass justification is required to approve this exception. | OK  |
| --- | --- | --- | --- |
| MSG-110 | Confirmation | Are you sure you want to approve the credit limit bypass for this order? | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-111 | Success | Credit limit bypass approved. The Buyer has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-112 | Success | Credit limit bypass denied. The Buyer has been notified with the reason. | OK  |
| --- | --- | --- | --- |
| MSG-113 | Error | An active warehouse receipt already exists for this order. | OK  |
| --- | --- | --- | --- |
| MSG-114 | Validation | All receipt fields are required: quantity, location, condition, and received date. | OK  |
| --- | --- | --- | --- |
| MSG-115 | Success | Warehouse receipt issued and locked successfully. | OK  |
| --- | --- | --- | --- |
| MSG-116 | Validation | Cancellation reason is required to void this receipt. | OK  |
| --- | --- | --- | --- |
| MSG-117 | Success | Cancellation receipt issued successfully. | OK  |
| --- | --- | --- | --- |
| MSG-118 | Error | Invoice not found or has no outstanding balance. | OK  |
| --- | --- | --- | --- |
| MSG-119 | Validation | Payment amount exceeds the outstanding invoice balance. | OK  |
| --- | --- | --- | --- |
| MSG-120 | Success | Payment receipt recorded. Accounts receivable and credit balance updated. | OK  |
| --- | --- | --- | --- |
| MSG-121 | Confirmation | Confirm 3-way match for Order {ID}? This action is irreversible. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-122 | Validation | Discrepancies detected. A justification note is required before confirming the match. | OK  |
| --- | --- | --- | --- |
| MSG-123 | Success | 3-way match confirmed. Order cleared and all linked documents are now permanently locked. | OK  |
| --- | --- | --- | --- |
| MSG-124 | Error | A vehicle with this license plate already exists in your fleet. | OK  |
| --- | --- | --- | --- |
| MSG-125 | Validation | Mandatory vehicle fields are missing: License Plate, Vehicle Type, Capacity Value, and Capacity Unit are required. | OK  |
| --- | --- | --- | --- |
| MSG-126 | Success | Vehicle profile created successfully and is now available for dispatch. | OK  |
| --- | --- | --- | --- |
| MSG-127 | Error | License plate cannot be changed after creation. | OK  |
| --- | --- | --- | --- |
| MSG-128 | Success | Vehicle profile updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-129 | Info | No vehicles found in your fleet. | OK  |
| --- | --- | --- | --- |
| MSG-130 | Warning | This vehicle is currently on an active trip. Deactivating it will not cancel the trip, but the driver will be unassigned from the vehicle record. Proceed? | Proceed / Cancel |
| --- | --- | --- | --- |
| MSG-131 | Success | Vehicle activation status updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-132 | Validation | License expiry date must be a future date. | OK  |
| --- | --- | --- | --- |
| MSG-133 | Success | Driver profile updated successfully. | OK  |
| --- | --- | --- | --- |
| MSG-134 | Error | This driver is already assigned to a vehicle. | OK  |
| --- | --- | --- | --- |
| MSG-135 | Error | This vehicle already has an assigned driver. | OK  |
| --- | --- | --- | --- |
| MSG-136 | Success | Driver-vehicle assignment created successfully. | OK  |
| --- | --- | --- | --- |
| MSG-137 | Error | No active assignment found for this record. | OK  |
| --- | --- | --- | --- |
| MSG-138 | Error | This vehicle is currently on an active trip. Unassignment is not permitted until the trip is completed or the incident is resolved. | OK  |
| --- | --- | --- | --- |
| MSG-139 | Success | Driver-vehicle assignment removed. Both driver and vehicle are now available. | OK  |
| --- | --- | --- | --- |
| MSG-140 | Warning | No active tariff found for this route and vehicle type. Please enter the freight price manually. | OK  |
| --- | --- | --- | --- |
| MSG-141 | Validation | All rate card fields are required: Origin Zone, Destination Zone, Vehicle Type, Unit of Measure, and Base Rate (positive number). | OK  |
| --- | --- | --- | --- |
| MSG-142 | Success | Transport tariff saved and is now active for new quotations. | OK  |
| --- | --- | --- | --- |
| MSG-143 | Validation | Quoted price must be a positive number. | OK  |
| --- | --- | --- | --- |
| MSG-144 | Success | Freight quotation submitted successfully. Buyer and Supplier have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-145 | Error | It is the other party's turn to respond. Please wait for their reply. | OK  |
| --- | --- | --- | --- |
| MSG-146 | Validation | Negotiation round must include a proposed freight rate (positive number) and estimated delivery date. | OK  |
| --- | --- | --- | --- |
| MSG-147 | Success | Negotiation round submitted. All parties have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-148 | Error | All parties must accept the latest negotiation round before the quotation can be finalized. | OK  |
| --- | --- | --- | --- |
| MSG-149 | Confirmation | Finalize this freight quotation? The agreed rate will be permanently locked and a shipment order will be created automatically. This action cannot be undone. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-150 | Success | Freight quotation finalized and locked. Shipment order created. Buyer and Supplier have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-151 | Error | Selected driver or vehicle is already on an active trip. | OK  |
| --- | --- | --- | --- |
| MSG-152 | Confirmation | Confirm dispatch of this transport order? The driver will be notified immediately and the order will be locked. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-153 | Success | Transport order dispatched successfully. Driver has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-154 | Confirmation | Finalize this invoice? This action is irreversible. The invoice will be permanently locked. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-155 | Success | Freight invoice finalized and locked. | OK  |
| --- | --- | --- | --- |
| MSG-156 | Validation | A correction reason is required to issue an adjustment invoice. | OK  |
| --- | --- | --- | --- |
| MSG-157 | Success | Adjustment invoice created and linked to the original. | OK  |
| --- | --- | --- | --- |
| MSG-158 | Error | No active trip found. Incident reporting is only available during an active trip. | OK  |
| --- | --- | --- | --- |
| MSG-159 | Validation | Incident report must include at least one photo, GPS coordinates, an incident type, and a description of at least 10 characters. | OK  |
| --- | --- | --- | --- |
| MSG-160 | Success | Incident reported successfully. The Carrier Manager has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-161 | Error | Access denied: you are not a participant of this shipment. | Close |
| --- | --- | --- | --- |
| MSG-162 | Error | Access denied: route playback is available to Carrier Manager and Platform Admin only. | Close |
| --- | --- | --- | --- |
| MSG-163 | Info | No GPS history records found for this shipment. | OK  |
| --- | --- | --- | --- |
| MSG-164 | Warning | You must be within 500 m of the delivery location to check in. Current distance: {X} m. | OK  |
| --- | --- | --- | --- |
| MSG-165 | Validation | Both a delivery photo and recipient signature are required before the e-POD can be submitted. | OK  |
| --- | --- | --- | --- |
| MSG-166 | Success | e-POD submitted successfully. Shipment order marked as COMPLETED. | OK  |
| --- | --- | --- | --- |
| MSG-167 | Validation | All expense fields are required: Type, Amount, Currency, Date, and at least one receipt file. | OK  |
| --- | --- | --- | --- |
| MSG-168 | Success | Expense submitted successfully and is pending manager approval. | OK  |
| --- | --- | --- | --- |
| MSG-169 | Validation | A rejection comment is required when rejecting an expense. | OK  |
| --- | --- | --- | --- |
| MSG-170 | Success | Expense decision recorded. The driver has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-171 | Info | Dashboard data is refreshed every 5 minutes. Last refreshed: {timestamp}. | OK  |
| --- | --- | --- | --- |
| MSG-172 | Validation | Date range is required and cannot exceed 366 days. | OK  |
| --- | --- | --- | --- |
| MSG-173 | Success | Report export complete. Your file is ready for download. | Download |
| --- | --- | --- | --- |
| MSG-174 | Info | No products found matching your current filters. | OK  |
| --- | --- | --- | --- |
| MSG-175 | Info | Item already in your RFQ list. Quantity has been updated. | OK  |
| --- | --- | --- | --- |
| MSG-176 | Success | Item added to RFQ list. | OK  |
| --- | --- | --- | --- |
| MSG-177 | Validation | Your RFQ list is empty. Add at least one item before submitting. | OK  |
| --- | --- | --- | --- |
| MSG-178 | Validation | One or more RFQ items are missing required fields. Please complete all mandatory fields before submitting. | OK  |
| --- | --- | --- | --- |
| MSG-179 | Success | RFQ submitted successfully. {N} supplier(s) have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-180 | Validation | Please select exactly one supplier quotation to proceed. | OK  |
| --- | --- | --- | --- |
| MSG-181 | Confirmation | Confirm selection of {SupplierName}'s quotation? All other quotations will be rejected and the RFQ will be closed. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-182 | Success | Supplier quotation selected. Purchase order creation has been initiated. | OK  |
| --- | --- | --- | --- |
| MSG-183 | Error | Selected staff member is not active or does not belong to this workspace. | OK  |
| --- | --- | --- | --- |
| MSG-184 | Success | Order task assigned successfully. The assignee has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-185 | Error | This staff member is already assigned to this order. | OK  |
| --- | --- | --- | --- |
| MSG-186 | Success | Order task reassigned. Both previous and new assignees have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-187 | Info | No tasks assigned to you at this time. | OK  |
| --- | --- | --- | --- |
| MSG-188 | Info | No orders found matching the applied filters. | OK  |
| --- | --- | --- | --- |
| MSG-189 | Validation | Date range is required and cannot exceed 366 days. | OK  |
| --- | --- | --- | --- |
| MSG-190 | Success | Export complete. Your file is ready for download. | Download |
| --- | --- | --- | --- |
| MSG-191 | Info | No freight quotations available for this order yet. | OK  |
| --- | --- | --- | --- |
| MSG-192 | Error | Access denied: you are not an authorized participant of this shipment. | Close |
| --- | --- | --- | --- |
| MSG-193 | Warning | Selected carrier ETA exceeds the agreed delivery date. Confirm selection anyway? | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-194 | Warning | Credit limit exceeded. This selection has been routed for credit approval. | OK  |
| --- | --- | --- | --- |
| MSG-195 | Confirmation | Confirm carrier {CarrierName}? The agreed freight rate will be permanently locked and a shipment order will be created. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-196 | Success | Carrier confirmed. Shipment order created. Carrier and Supplier have been notified. | OK  |
| --- | --- | --- | --- |
| MSG-197 | Error | Access denied: e-POD is only accessible to authorized shipment participants. | Close |
| --- | --- | --- | --- |
| MSG-198 | Info | Please review all e-POD evidence before accepting or raising a dispute. Both actions are irreversible. | OK  |
| --- | --- | --- | --- |
| MSG-199 | Confirmation | Confirm goods receipt for Order {OrderID}? This action is irreversible. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-200 | Success | Goods receipt confirmed. A payable has been recorded. | OK  |
| --- | --- | --- | --- |
| MSG-201 | Info | Goods receipt was automatically confirmed after 48 hours without response. | OK  |
| --- | --- | --- | --- |
| MSG-202 | Validation | A discrepancy justification is required before confirming the 3-way match. | OK  |
| --- | --- | --- | --- |
| MSG-203 | Confirmation | Confirm 3-way match for Order {OrderID}? All linked documents will be permanently locked. This action cannot be undone. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-204 | Error | Payment is blocked until 3-way matching is confirmed for this order. | OK  |
| --- | --- | --- | --- |
| MSG-205 | Success | 3-way match confirmed. Payment is now unblocked and all linked documents are permanently locked. | OK  |
| --- | --- | --- | --- |
| MSG-206 | Error | Payment cannot be executed until 3-way matching is confirmed for this order. | OK  |
| --- | --- | --- | --- |
| MSG-207 | Validation | Payment amount must match the approved invoice amount of {Amount}. | OK  |
| --- | --- | --- | --- |
| MSG-208 | Confirmation | Confirm payment of {Amount} for Order {OrderID}? This action is irreversible. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-209 | Success | Payment executed successfully. The Supplier has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-210 | Validation | Complaint description must be at least 20 characters and at least one evidence file is required. | OK  |
| --- | --- | --- | --- |
| MSG-211 | Success | Complaint filed successfully. Case number: {CaseID}. | OK  |
| --- | --- | --- | --- |
| MSG-212 | Error | Only complaints with status "In Progress" can be escalated. | OK  |
| --- | --- | --- | --- |
| MSG-213 | Validation | An escalation reason is required to proceed. | OK  |
| --- | --- | --- | --- |
| MSG-214 | Confirmation | Escalate this complaint to Platform Admin? The admin team will be notified immediately. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-215 | Success | Complaint escalated. Platform Admin has been notified. | OK  |
| --- | --- | --- | --- |
| MSG-216 | Error | This email is already registered in your workspace. | OK  |
| --- | --- | --- | --- |
| MSG-217 | Validation | Mandatory fields are missing. All employees require: Full Name, Email, Phone Number, National ID, Avatar, Role, Department, and Date of Birth. | OK  |
| --- | --- | --- | --- |
| MSG-218 | Validation | Driver profiles require Front ID Card and Back ID Card images (JPG/PNG, max 5 MB each). | OK  |
| --- | --- | --- | --- |
| MSG-219 | Validation | File is invalid. Only JPG or PNG files up to 5 MB are accepted for this field. | OK  |
| --- | --- | --- | --- |
| MSG-220 | Success | Employee profile created. An activation email has been sent to {Email}. | OK  |
| --- | --- | --- | --- |
| MSG-221 | Validation | Selected role is not valid for this workspace type. | OK  |
| --- | --- | --- | --- |
| MSG-222 | Confirmation | Change role of {EmployeeName} from {OldRole} to {NewRole}? All active sessions will be terminated immediately. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-223 | Success | Role updated successfully. Active sessions for {EmployeeName} have been terminated. | OK  |
| --- | --- | --- | --- |
| MSG-224 | Confirmation | Deactivate account for {EmployeeName}? All active sessions will be terminated immediately and the account cannot log in. | Deactivate / Cancel |
| --- | --- | --- | --- |
| MSG-225 | Warning | This employee is a Driver currently on an active trip. Deactivating will remove them from vehicle assignment but will NOT cancel the active trip. Proceed? | Proceed / Cancel |
| --- | --- | --- | --- |
| MSG-226 | Success | Account deactivated. All sessions have been terminated. | OK  |
| --- | --- | --- | --- |
| MSG-227 | Confirmation | Reactivate account for {EmployeeName}? They will be able to log in immediately after reactivation. | Reactivate / Cancel |
| --- | --- | --- | --- |
| MSG-228 | Success | Account reactivated. {EmployeeName} has been notified and can now log in. | OK  |
| --- | --- | --- | --- |
| MSG-229 | Info | No KPI data found for the selected period and filters. | OK  |
| --- | --- | --- | --- |
| MSG-230 | Warning | Total KPI weight for {EmployeeName} in {Period} is {TotalWeight}%, not 100%. This configuration is saved as a draft and will not be used for final scoring until weights sum to 100%. | OK  |
| --- | --- | --- | --- |
| MSG-231 | Success | KPI targets saved successfully for {EmployeeName} — {Period}. | OK  |
| --- | --- | --- | --- |
| MSG-232 | Validation | Actual value must be a non-negative number. | OK  |
| --- | --- | --- | --- |
| MSG-233 | Success | KPI results updated. Completion percentage has been recalculated. | OK  |
| --- | --- | --- | --- |
| MSG-234 | Info | No KPI targets have been set for the selected period yet. Please contact your HR Manager. | OK  |
| --- | --- | --- | --- |
| MSG-235 | Info | No KPI data available for the selected period and department. | OK  |
| --- | --- | --- | --- |
| MSG-236 | Success | KPI report exported successfully. | Download |
| --- | --- | --- | --- |
| MSG-237 | Validation | Notification title cannot exceed 200 characters and message body cannot exceed 2000 characters. | OK  |
| --- | --- | --- | --- |
| MSG-238 | Validation | Scheduled delivery time must be in the future. | OK  |
| --- | --- | --- | --- |
| MSG-239 | Confirmation | Broadcast this notification to ALL active users on the platform? This action cannot be undone. | Broadcast / Cancel |
| --- | --- | --- | --- |
| MSG-240 | Success | Notification broadcasted successfully to {N} active users. | OK  |
| --- | --- | --- | --- |
| MSG-241 | Success | Notification scheduled for delivery at {ScheduledAt}. | OK  |
| --- | --- | --- | --- |
| MSG-242 | Confirmation | Cancel scheduled notification "{Title}"? This action cannot be undone. | Confirm / Cancel |
| --- | --- | --- | --- |
| MSG-243 | Success | Scheduled notification cancelled successfully. | OK  |
| --- | --- | --- | --- |
| MSG-244 | Validation | File exceeds the maximum allowed size for this field: {MaxSize} MB. Please upload a smaller file. | OK  |
| --- | --- | --- | --- |
| MSG-245 | Validation | File type not allowed. Accepted formats for this field: {AllowedFormats}. | OK  |
| --- | --- | --- | --- |
| MSG-246 | Error | Storage quota exceeded. Please contact your administrator to increase your workspace storage limit. | OK  |
| --- | --- | --- | --- |
| MSG-247 | Success | File uploaded successfully. | OK  |
| --- | --- | --- | --- |
| MSG-248 | Error | Access denied: you do not have permission to access this file. | Close |
| --- | --- | --- | --- |
| MSG-249 | Error | This link has expired. Please request a new access link. | OK  |
| --- | --- | --- | --- |

##### 

## Issues List

N/A