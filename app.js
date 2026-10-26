(() => {
  const safeStore = {
    memory: {},
    get(key) {
      try { const value = localStorage.getItem(key); return value === null ? this.memory[key] : value; }
      catch { return this.memory[key]; }
    },
    set(key, value) {
      this.memory[key] = value;
      try { localStorage.setItem(key, value); } catch {}
    }
  };

  const seedCustomers = [
    {id:"c1",name:"سارة أحمد",email:"sara.ahmed@example.com",phone:"+966 50 123 4567"},
    {id:"c2",name:"محمد العتيبي",email:"m.alotaibi@example.com",phone:"+966 55 234 5678"},
    {id:"c3",name:"نورة خالد",email:"noura.k@example.com",phone:"+966 54 345 6789"},
    {id:"c4",name:"عبدالله سالم",email:"abdullah.s@example.com",phone:"+966 56 456 7890"},
    {id:"c5",name:"ريم الحربي",email:"reem.h@example.com",phone:"+966 59 567 8901"},
    {id:"c6",name:"فهد منصور",email:"fahad.m@example.com",phone:"+966 53 678 9012"}
  ];
  const seedOrders = [
    {id:"1048",customer:"سارة أحمد",date:"2025-06-18",amount:1280,status:"مكتمل"},
    {id:"1047",customer:"محمد العتيبي",date:"2025-06-17",amount:640,status:"قيد التجهيز"},
    {id:"1046",customer:"نورة خالد",date:"2025-06-16",amount:2190,status:"مكتمل"},
    {id:"1045",customer:"عبدالله سالم",date:"2025-06-14",amount:385,status:"قيد التجهيز"},
    {id:"1044",customer:"ريم الحربي",date:"2025-06-12",amount:950,status:"ملغي"},
    {id:"1043",customer:"فهد منصور",date:"2025-06-10",amount:1560,status:"مكتمل"},
    {id:"1042",customer:"سارة أحمد",date:"2025-06-08",amount:780,status:"مكتمل"},
    {id:"1041",customer:"محمد العتيبي",date:"2025-06-05",amount:430,status:"قيد التجهيز"},
    {id:"1040",customer:"نورة خالد",date:"2025-06-02",amount:1725,status:"مكتمل"}
  ];
  const load = (key, seed) => {
    try { const parsed = JSON.parse(safeStore.get(key)); return Array.isArray(parsed) ? parsed : seed; }
    catch { return seed; }
  };
  let customers = load("sales-dashboard-customers", seedCustomers);
  const orders = seedOrders;
  const $ = id => document.getElementById(id);
  const formatMoney = value => new Intl.NumberFormat("ar-SA").format(value) + " ر.س";
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const customerOrders = name => orders.filter(order => order.customer === name).length;
  const dateLabel = date => new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short"}).format(new Date(date+"T12:00:00"));
  const initials = name => escapeHTML((name || "?").trim().charAt(0));

  function renderOrders(list, target) {
    $(target).innerHTML = list.map(order => {
      const statusClass = order.status === "مكتمل" ? "completed" : order.status === "ملغي" ? "cancelled" : "pending";
      return `<tr><td><span class="order-id">#${escapeHTML(order.id)}</span></td><td>${escapeHTML(order.customer)}</td><td>${dateLabel(order.date)}</td><td><span class="status ${statusClass}">${escapeHTML(order.status)}</span></td><td class="amount">${formatMoney(order.amount)}</td></tr>`;
    }).join("");
  }

  function drawChart() {
    const values = [9200,11800,10500,15100,13700,18400];
    const labels = ["يناير","فبراير","مارس","أبريل","مايو","يونيو"];
    const points = values.map((v,i) => `${i*144},${210-(v/20000)*190}`).join(" ");
    $("salesChart").innerHTML = `<defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6558d9" stop-opacity=".20"/><stop offset="1" stop-color="#6558d9" stop-opacity="0"/></linearGradient></defs><polygon class="chart-fill" points="0,230 ${points} 720,230"/><polyline class="chart-line" points="${points}"/>${values.map((v,i)=>`<circle cx="${i*144}" cy="${210-(v/20000)*190}" r="4"/>`).join("")}`;
    $("chartLabels").innerHTML = labels.map(label=>`<span>${label}</span>`).join("");
  }

  function renderCustomers() {
    const query = $("customerSearch").value.trim().toLocaleLowerCase("ar");
    const filtered = customers.filter(c => `${c.name} ${c.email} ${c.phone}`.toLocaleLowerCase("ar").includes(query));
    $("customersSummary").textContent = `${customers.length} عملاء مسجلون في متجرك`;
    $("customersEmpty").classList.toggle("hidden", filtered.length > 0);
    $("customersTable").innerHTML = filtered.map(c => `<tr>
      <td><div class="customer-cell"><span class="customer-avatar">${initials(c.name)}</span><strong>${escapeHTML(c.name)}</strong></div></td>
      <td>${escapeHTML(c.email)}</td><td>${escapeHTML(c.phone)}</td>
      <td>${customerOrders(c.name)} طلبات</td>
      <td><div class="row-actions"><button class="small-action" data-edit="${escapeHTML(c.id)}">تعديل</button><button class="small-action delete" data-delete="${escapeHTML(c.id)}">حذف</button></div></td>
    </tr>`).join("");
    $("customersStat").textContent = new Intl.NumberFormat("ar-SA").format(customers.length);
  }

  function renderAllOrders() {
    const query = $("orderSearch").value.trim().toLocaleLowerCase("ar");
    const sort = $("orderSort").value;
    let filtered = orders.filter(o => `${o.id} ${o.customer} ${o.status}`.toLocaleLowerCase("ar").includes(query));
    filtered = [...filtered].sort((a,b) => sort === "oldest" ? a.date.localeCompare(b.date) : sort === "highest" ? b.amount-a.amount : sort === "lowest" ? a.amount-b.amount : b.date.localeCompare(a.date));
    renderOrders(filtered,"ordersTable");
    $("ordersEmpty").classList.toggle("hidden",filtered.length>0);
    $("ordersSummary").textContent = `${filtered.length} من أصل ${orders.length} طلبات`;
  }

  function renderStats() {
    const completed = orders.filter(o => o.status === "مكتمل");
    const total = completed.reduce((sum,o)=>sum+o.amount,0);
    $("salesStat").textContent = formatMoney(total);
    $("ordersStat").textContent = new Intl.NumberFormat("ar-SA").format(orders.length);
    $("averageStat").textContent = formatMoney(Math.round(total/(completed.length || 1)));
    $("orderNavCount").textContent = orders.length;
  }

  function render() {
    renderStats();
    renderCustomers();
    renderAllOrders();
    renderOrders([...orders].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5),"recentOrders");
  }

  function updateRoute() {
    const section = location.hash.replace("#","") || "overview";
    const valid = ["overview","orders","customers"].includes(section) ? section : "overview";
    document.querySelectorAll(".page-section").forEach(el=>el.classList.toggle("active",el.id===valid));
    document.querySelectorAll(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.section===valid));
    $("crumbTitle").textContent = ({overview:"نظرة عامة",orders:"الطلبات",customers:"العملاء"})[valid];
    $("sidebar").classList.remove("open");
    window.scrollTo(0,0);
  }

  const modal = $("customerModal");
  function closeModal() { modal.classList.add("hidden"); $("customerForm").reset(); $("customerId").value=""; $("formError").textContent=""; }
  function openModal(customer) {
    $("customerForm").reset();
    $("formError").textContent="";
    $("customerId").value=customer?.id || "";
    $("customerName").value=customer?.name || "";
    $("customerEmail").value=customer?.email || "";
    $("customerPhone").value=customer?.phone || "";
    $("modalTitle").textContent=customer ? "تعديل بيانات العميل" : "إضافة عميل جديد";
    modal.classList.remove("hidden");
    $("customerName").focus();
  }
  let toastTimer;
  function toast(message) {
    $("toast").textContent=message;
    $("toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600);
  }

  $("customerForm").addEventListener("submit",event=>{
    event.preventDefault();
    const id=$("customerId").value;
    const customer={id:id || `c${Date.now()}`,name:$("customerName").value.trim(),email:$("customerEmail").value.trim(),phone:$("customerPhone").value.trim()};
    const duplicate=customers.some(c=>c.email.toLowerCase()===customer.email.toLowerCase() && c.id!==id);
    if(duplicate){$("formError").textContent="هذا البريد الإلكتروني مسجل لعميل آخر.";return;}
    if(id) customers=customers.map(c=>c.id===id?customer:c);
    else customers=[customer,...customers];
    safeStore.set("sales-dashboard-customers",JSON.stringify(customers));
    closeModal();render();toast(id?"تم تحديث بيانات العميل":"تمت إضافة العميل بنجاح");
  });

  $("customersTable").addEventListener("click",event=>{
    const edit=event.target.closest("[data-edit]");
    const remove=event.target.closest("[data-delete]");
    if(edit){const customer=customers.find(c=>c.id===edit.dataset.edit);if(customer)openModal(customer);}
    if(remove){
      const customer=customers.find(c=>c.id===remove.dataset.delete);
      if(customer && confirm(`هل تريد حذف العميل ${customer.name}؟`)){
        customers=customers.filter(c=>c.id!==customer.id);
        safeStore.set("sales-dashboard-customers",JSON.stringify(customers));
        render();toast("تم حذف العميل");
      }
    }
  });

  $("customerSearch").addEventListener("input",renderCustomers);
  $("orderSearch").addEventListener("input",renderAllOrders);
  $("orderSort").addEventListener("change",renderAllOrders);
  $("addCustomerButton").addEventListener("click",()=>openModal());
  $("closeModal").addEventListener("click",closeModal);
  $("cancelModal").addEventListener("click",closeModal);
  modal.addEventListener("click",event=>{if(event.target===modal)closeModal();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"){closeModal();$("sidebar").classList.remove("open");}});
  $("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
  $("refreshButton").addEventListener("click",()=>{render();toast("تم تحديث بيانات اللوحة");});
  window.addEventListener("hashchange",updateRoute);
  $("todayDate").textContent=new Intl.DateTimeFormat("ar-SA",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
  drawChart();render();updateRoute();
})();
